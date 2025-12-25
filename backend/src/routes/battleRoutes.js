import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "../database/db-postgres.js";
import { matchQueue, battleTimeoutQueue } from "../queue.js";
import { judgeQueue } from "../queue.js";
import CodeJudge from "../judge.js";
import { getDifficultyLabel } from "../utils/matchmaking.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const judge = new CodeJudge();

// Join matchmaking queue
router.post("/join-queue", async (req, res) => {
  const userId = req.userId;

  try {
    // Check if user is already in queue
    const existingQueue = await query(
      'SELECT * FROM match_queue WHERE user_id = $1 AND status = $2',
      [userId, 'waiting']
    );

    if (existingQueue.rows.length > 0) {
      return res.status(400).json({
        error: "You are already in the matchmaking queue"
      });
    }

    // Check if user has an active battle
    const activeBattle = await query(
      `SELECT * FROM battles 
       WHERE (player1_id = $1 OR player2_id = $1) 
       AND status IN ('waiting', 'active')`,
      [userId]
    );

    if (activeBattle.rows.length > 0) {
      return res.status(400).json({
        error: "You already have an active battle"
      });
    }

    // Get latest rating
    const ratingResult = await query(
      'SELECT rating FROM users WHERE id = $1',
      [userId]
    );
    const rating = ratingResult.rows[0]?.rating ?? 400;

    // Add user to queue
    await query(
      `INSERT INTO match_queue (user_id, status, queued_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE 
       SET status = EXCLUDED.status,
           queued_at = EXCLUDED.queued_at
       WHERE match_queue.status <> 'waiting'`,
      [userId, 'waiting']
    );

    // Add job to match queue
    await matchQueue.add('match', {
      userId
    }, {
      attempts: 0, // Retry indefinitely
      backoff: {
        type: 'fixed',
        delay: 5000 // 5 seconds between retries
      }
    });

    res.json({
      success: true,
      message: "Searching for opponent...",
      rating,
      searchDifficulty: getDifficultyLabel(rating)
    });
  } catch (error) {
    console.error("Error joining queue:", error);
    res.status(500).json({ error: "Failed to join matchmaking queue" });
  }
});

// Leave matchmaking queue
router.post("/leave-queue", async (req, res) => {
  const userId = req.userId;

  try {
    // Remove from database queue
    const result = await query(
      'UPDATE match_queue SET status = $1 WHERE user_id = $2 AND status = $3',
      ['cancelled', userId, 'waiting']
    );

    // Remove any pending match jobs for this user
    const jobs = await matchQueue.getJobs(['waiting', 'delayed']);
    for (const job of jobs) {
      if (job.data.userId === userId) {
        await job.remove();
      }
    }

    res.json({
      success: true,
      message: "Left matchmaking queue"
    });
  } catch (error) {
    console.error("Error leaving queue:", error);
    res.status(500).json({ error: "Failed to leave matchmaking queue" });
  }
});

// Get matchmaking status
router.get("/status", async (req, res) => {
  const userId = req.userId;

  try {
    // Clean up stale pending battles (older than 30 seconds) - they should have timed out
    await query(
      `UPDATE battles 
       SET status = 'cancelled' 
       WHERE status = 'pending' 
       AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 seconds'`
    );

    // Check for active/pending battle first (takes priority over queued status)
    // Exclude pending battles older than 30 seconds (they should have been cancelled)
    const battle = await query(
      `SELECT *, 
              created_at AT TIME ZONE 'UTC' AS created_at_utc
       FROM battles 
       WHERE (player1_id = $1 OR player2_id = $1) 
       AND status IN ('pending', 'waiting', 'active')
       AND (status != 'pending' OR created_at > CURRENT_TIMESTAMP - INTERVAL '30 seconds')
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (battle.rows.length > 0) {
      const battleData = battle.rows[0];
      const isPlayer1 = battleData.player1_id === userId;
      const opponentId = isPlayer1 ? battleData.player2_id : battleData.player1_id;

      // Get opponent info
      const opponentResult = await query(
        'SELECT id, username, display_name, avatar_animal, avatar_color, rating FROM users WHERE id = $1',
        [opponentId]
      );

      // Use created_at_utc if available, otherwise fall back to created_at
      const createdAt = battleData.created_at_utc || battleData.created_at;

      return res.json({
        status: 'matched',
        battleId: battleData.id,
        opponent: opponentResult.rows[0],
        exerciseId: battleData.exercise_id,
        startedAt: battleData.started_at,
        createdAt: createdAt ? new Date(createdAt).toISOString() : null, // Convert to ISO string (UTC)
        player1Accepted: battleData.player1_accepted,
        player2Accepted: battleData.player2_accepted
      });
    }

    // Check if in queue
    const queueStatus = await query(
      'SELECT * FROM match_queue WHERE user_id = $1 AND status = $2',
      [userId, 'waiting']
    );

    if (queueStatus.rows.length > 0) {
      const ratingResult = await query(
        'SELECT rating FROM users WHERE id = $1',
        [userId]
      );
      const rating = ratingResult.rows[0]?.rating ?? 400;

      return res.json({
        status: 'queued',
        queuedAt: queueStatus.rows[0].queued_at,
        rating,
        searchDifficulty: getDifficultyLabel(rating)
      });
    }

    res.json({ status: 'none' });
  } catch (error) {
    console.error("Error getting match status:", error);
    res.status(500).json({ error: "Failed to get match status" });
  }
});

// Get active battle details
router.get("/active", async (req, res) => {
  const userId = req.userId;

  try {
    // Clean up stale pending battles (older than 30 seconds) - they should have timed out
    await query(
      `UPDATE battles 
       SET status = 'cancelled' 
       WHERE status = 'pending' 
       AND created_at < CURRENT_TIMESTAMP - INTERVAL '30 seconds'`
    );

    const battleResult = await query(
      `SELECT *, 
              created_at AT TIME ZONE 'UTC' AS created_at_utc
       FROM battles 
       WHERE (player1_id = $1 OR player2_id = $1) 
       AND (
         status IN ('pending', 'waiting', 'active')
         OR (status = 'completed' AND ended_at > CURRENT_TIMESTAMP - INTERVAL '60 seconds')
       )
       AND (status != 'pending' OR created_at > CURRENT_TIMESTAMP - INTERVAL '30 seconds')
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (battleResult.rows.length === 0) {
      return res.status(404).json({ error: "No active battle found" });
    }

    const battle = battleResult.rows[0];
    const isPlayer1 = battle.player1_id === userId;
    const opponentId = isPlayer1 ? battle.player2_id : battle.player1_id;

    // Get opponent info
    const opponentResult = await query(
      'SELECT id, username, display_name, avatar_animal, avatar_color, rating FROM users WHERE id = $1',
      [opponentId]
    );

    // Get exercise details
    const exercisesDir = path.join(__dirname, '..', '..', 'exercises');
    const exerciseId = battle.exercise_id;
    const problemPath = path.join(exercisesDir, exerciseId, 'problem.md');
    const configPath = path.join(exercisesDir, exerciseId, 'config.json');

    let exercise = null;
    if (fs.existsSync(problemPath) && fs.existsSync(configPath)) {
      const problemContent = fs.readFileSync(problemPath, 'utf8');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      let starterCode = "";
      if (config.starterCode) {
        const starterPath = path.join(exercisesDir, exerciseId, config.starterCode);
        starterCode = fs.readFileSync(starterPath, 'utf8');
      }

      exercise = {
        id: exerciseId,
        content: problemContent,
        difficulty: config.difficulty,
        tags: config.tags,
        timeLimit: config.timeLimit,
        memoryLimit: config.memoryLimit,
        editable_start: config.editable_start,
        editable_end: config.editable_end,
        starterCode
      };
    }

    // Get submissions if any
    const submissions = [];
    if (battle.player1_submission_id) {
      const sub1 = await query('SELECT * FROM submissions WHERE id = $1', [battle.player1_submission_id]);
      if (sub1.rows.length > 0) submissions.push({ ...sub1.rows[0], player: 'player1' });
    }
    if (battle.player2_submission_id) {
      const sub2 = await query('SELECT * FROM submissions WHERE id = $1', [battle.player2_submission_id]);
      if (sub2.rows.length > 0) submissions.push({ ...sub2.rows[0], player: 'player2' });
    }

    // Use created_at_utc if available, otherwise fall back to created_at
    const createdAt = battle.created_at_utc || battle.created_at;

    res.json({
      battle: {
        id: battle.id,
        status: battle.status,
        exerciseId: battle.exercise_id,
        startedAt: battle.started_at,
        createdAt: createdAt ? new Date(createdAt).toISOString() : null, // Convert to ISO string (UTC)
        isPlayer1,
        winnerId: battle.winner_id,
        player1Accepted: battle.player1_accepted,
        player2Accepted: battle.player2_accepted
      },
      opponent: opponentResult.rows[0],
      exercise,
      submissions
    });
  } catch (error) {
    console.error("Error getting active battle:", error);
    res.status(500).json({ error: "Failed to get active battle" });
  }
});

// Accept match (player clicks Accept within the acceptance window)
router.post('/:id/accept', async (req, res) => {
  const userId = req.userId;
  const battleId = req.params.id;
  const MAX_BATTLE_DURATION_MS = 20 * 60 * 1000;

  try {
    const br = await query('SELECT * FROM battles WHERE id = $1', [battleId]);
    if (br.rowCount === 0) return res.status(404).json({ error: 'Battle not found' });
    const battle = br.rows[0];

    if (battle.status !== 'pending') {
      return res.status(400).json({ error: 'Battle is not pending acceptance' });
    }

    if (userId !== battle.player1_id && userId !== battle.player2_id) {
      return res.status(403).json({ error: 'Not a participant of this battle' });
    }

    const col = userId === battle.player1_id ? 'player1_accepted' : 'player2_accepted';
    await query(`UPDATE battles SET ${col} = TRUE WHERE id = $1`, [battleId]);

    const updated = await query('SELECT player1_accepted, player2_accepted FROM battles WHERE id = $1', [battleId]);
    const { player1_accepted, player2_accepted } = updated.rows[0];

    // If both accepted, activate the battle
    if (player1_accepted && player2_accepted) {
      await query(`UPDATE battles SET status = $1, started_at = CURRENT_TIMESTAMP WHERE id = $2`, ['active', battleId]);

      // Remove accept timeout job if present
      try { await battleTimeoutQueue.remove(`battle-accept-${battleId}`); } catch (e) { }

      // Schedule battle duration timeout
      try {
        await battleTimeoutQueue.add('timeout', { battleId }, { jobId: `battle-timeout-${battleId}`, delay: MAX_BATTLE_DURATION_MS, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
      } catch (e) { console.warn('Could not schedule battle duration timeout:', e.message || e); }
    }

    res.json({ success: true, bothAccepted: !!(player1_accepted && player2_accepted) });
  } catch (err) {
    console.error('Error accepting battle:', err);
    res.status(500).json({ error: 'Failed to accept battle' });
  }
});

// Resign from battle
router.post('/:id/resign', async (req, res) => {
  const userId = req.userId;
  const battleId = req.params.id;

  try {
    const br = await query('SELECT * FROM battles WHERE id = $1', [battleId]);
    if (br.rowCount === 0) return res.status(404).json({ error: 'Battle not found' });
    const battle = br.rows[0];

    if (battle.status !== 'active') {
      return res.status(400).json({ error: 'Battle is not active' });
    }

    if (userId !== battle.player1_id && userId !== battle.player2_id) {
      return res.status(403).json({ error: 'Not a participant of this battle' });
    }

    // Determine winner (opponent) and loser (resigning player)
    const winnerId = userId === battle.player1_id ? battle.player2_id : battle.player1_id;
    const loserId = userId;

    // Mark battle as completed with opponent as winner
    await query(
      `UPDATE battles SET status = $1, winner_id = $2, ended_at = CURRENT_TIMESTAMP WHERE id = $3`,
      ['completed', winnerId, battleId]
    );

    // Update ratings: winner gets points, resigner loses points
    // Use a simplified rating calculation for resignation
    try {
      await query('BEGIN');

      const playersResult = await query(
        `SELECT id, rating, win_streak, loss_streak, k_win, k_lose FROM users WHERE id = ANY($1) ORDER BY id FOR UPDATE`,
        [[battle.player1_id, battle.player2_id]]
      );

      if (playersResult.rowCount >= 2) {
        const playerMap = new Map(playersResult.rows.map((row) => [row.id, row]));
        const winner = playerMap.get(winnerId);
        const loser = playerMap.get(loserId);

        if (winner && loser) {
          // Calculate expected scores
          const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
          const expectedLoser = 1 - expectedWinner;

          // Use k_win for winner, k_lose for loser
          const kWinner = winner.k_win || 40;
          const kLoser = loser.k_lose || 30;

          // Winner gets 1.0, loser gets 0.0 for resignation
          let deltaWinner = Math.round(kWinner * (1.0 - expectedWinner));
          let deltaLoser = Math.round(kLoser * (0.0 - expectedLoser));

          // Ensure minimum changes
          if (deltaWinner < 1) deltaWinner = 1;
          if (deltaLoser > -1) deltaLoser = -1;

          const ratingFloor = 200;
          const newRatingWinner = Math.max(ratingFloor, winner.rating + deltaWinner);
          const newRatingLoser = Math.max(ratingFloor, loser.rating + deltaLoser);

          // Update streaks
          const winnerStreaks = { winStreak: winner.win_streak + 1, lossStreak: 0 };
          const loserStreaks = { winStreak: 0, lossStreak: loser.loss_streak + 1 };

          // Update winner
          await query(
            `UPDATE users SET rating = $1, win_streak = $2, loss_streak = $3 WHERE id = $4`,
            [newRatingWinner, winnerStreaks.winStreak, winnerStreaks.lossStreak, winnerId]
          );

          // Update loser
          await query(
            `UPDATE users SET rating = $1, win_streak = $2, loss_streak = $3 WHERE id = $4`,
            [newRatingLoser, loserStreaks.winStreak, loserStreaks.lossStreak, loserId]
          );

          await query('COMMIT');

          console.log(
            `Battle ${battleId}: Player ${userId} resigned. ` +
            `Winner ${winnerId}: ${winner.rating}→${newRatingWinner} (+${deltaWinner}), ` +
            `Loser ${loserId}: ${loser.rating}→${newRatingLoser} (${deltaLoser})`
          );
        } else {
          await query('ROLLBACK');
        }
      } else {
        await query('ROLLBACK');
      }
    } catch (err) {
      console.error('Error updating ratings on resign:', err);
      try { await query('ROLLBACK'); } catch (e) { }
    }

    // Mark players' queue entries as completed
    await query(
      `UPDATE match_queue SET status = 'completed' WHERE user_id = ANY($1)`,
      [[battle.player1_id, battle.player2_id]]
    );

    res.json({ success: true, message: 'You have resigned from the battle' });
  } catch (err) {
    console.error('Error resigning from battle:', err);
    res.status(500).json({ error: 'Failed to resign from battle' });
  }
});

// Submit code during battle
router.post("/submit", async (req, res) => {
  const { battleId, code, exerciseId } = req.body;
  const userId = req.userId;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code is required and must be a string" });
  }

  if (!battleId || !exerciseId) {
    return res.status(400).json({ error: "battleId and exerciseId are required" });
  }

  try {
    // Verify user is part of this battle
    const battleResult = await query(
      'SELECT * FROM battles WHERE id = $1 AND (player1_id = $2 OR player2_id = $2) AND status = $3',
      [battleId, userId, 'active']
    );

    if (battleResult.rows.length === 0) {
      return res.status(404).json({ error: "Battle not found or not active" });
    }

    const battle = battleResult.rows[0];
    const isPlayer1 = battle.player1_id === userId;
    const submissionField = isPlayer1 ? 'player1_submission_id' : 'player2_submission_id';

    // Read-only code protection (similar to practice)
    const exercisePath = path.join(__dirname, '..', '..', 'exercises', exerciseId);
    const configPath = path.join(exercisePath, "config.json");

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

      if (config.starterCode) {
        const starterPath = path.join(exercisePath, config.starterCode);
        const starterCode = fs.readFileSync(starterPath, "utf8");

        const starterLines = starterCode.split("\n");
        const userLines = code.split("\n");

        const rawEditableStart = Number.isInteger(config.editable_start) && config.editable_start > 0
          ? config.editable_start : 1;
        const rawEditableEnd = Number.isInteger(config.editable_end) && config.editable_end > 0
          ? config.editable_end : starterLines.length;

        const editable_start = Math.max(0, Math.min(rawEditableStart - 1, starterLines.length - 1));
        const editable_end = Math.max(editable_start, Math.min(rawEditableEnd - 1, starterLines.length - 1));

        const protectedTopCount = editable_start;
        const protectedBottomCount = Math.max(starterLines.length - (editable_end + 1), 0);

        if (userLines.length < protectedTopCount + protectedBottomCount) {
          return res.status(400).json({ error: "You removed protected starter code." });
        }

        const compareLines = (starterLine, userLine, lineNumber) => {
          if (starterLine.trim() !== (userLine ?? "").trim()) {
            throw new Error(lineNumber.toString());
          }
        };

        try {
          for (let i = 0; i < protectedTopCount; i++) {
            compareLines(starterLines[i], userLines[i], i + 1);
          }
          for (let i = 0; i < protectedBottomCount; i++) {
            const starterIndex = starterLines.length - protectedBottomCount + i;
            const userIndex = userLines.length - protectedBottomCount + i;
            compareLines(starterLines[starterIndex], userLines[userIndex], starterIndex + 1);
          }
        } catch (error) {
          return res.status(400).json({
            error: `You modified protected line ${error.message}.`
          });
        }
      }
    }

    // Create submission
    const submissionResult = await query(
      `INSERT INTO submissions (user_id, exercise_id, code, language, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [userId, exerciseId, code, null, 'queued']
    );

    const submissionId = submissionResult.rows[0].id;

    // Update battle with submission ID
    await query(
      `UPDATE battles SET ${submissionField} = $1 WHERE id = $2`,
      [submissionId, battleId]
    );

    // Add to judge queue
    await judgeQueue.add("judge", {
      submissionId,
      userId,
      exerciseId,
      code,
      language: "auto",
      battleId // Pass battleId to check for winner
    });

    res.json({
      success: true,
      message: "Your submission has been queued",
      submissionId
    });
  } catch (error) {
    console.error("Error submitting battle code:", error);
    res.status(500).json({ error: "Failed to submit code" });
  }
});

// Get battle by ID
router.get("/:id", async (req, res) => {
  const battleId = req.params.id;
  const userId = req.userId;

  try {
    const battleResult = await query(
      'SELECT * FROM battles WHERE id = $1 AND (player1_id = $2 OR player2_id = $2)',
      [battleId, userId]
    );

    if (battleResult.rows.length === 0) {
      return res.status(404).json({ error: "Battle not found" });
    }

    const battle = battleResult.rows[0];
    const isPlayer1 = battle.player1_id === userId;
    const opponentId = isPlayer1 ? battle.player2_id : battle.player1_id;

    // Get opponent info
    const opponentResult = await query(
      'SELECT id, username FROM users WHERE id = $1',
      [opponentId]
    );

    // Get submissions
    const submissions = [];
    if (battle.player1_submission_id) {
      const sub1 = await query('SELECT * FROM submissions WHERE id = $1', [battle.player1_submission_id]);
      if (sub1.rows.length > 0) submissions.push({ ...sub1.rows[0], player: 'player1' });
    }
    if (battle.player2_submission_id) {
      const sub2 = await query('SELECT * FROM submissions WHERE id = $1', [battle.player2_submission_id]);
      if (sub2.rows.length > 0) submissions.push({ ...sub2.rows[0], player: 'player2' });
    }

    res.json({
      battle: {
        ...battle,
        isPlayer1
      },
      opponent: opponentResult.rows[0],
      submissions
    });
  } catch (error) {
    console.error("Error getting battle:", error);
    res.status(500).json({ error: "Failed to get battle" });
  }
});

export default router;

