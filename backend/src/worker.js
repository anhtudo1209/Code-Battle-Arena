import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (override any existing env vars)
// From backend/src, we need to go up 2 levels to reach project root
dotenv.config({ path: path.resolve(__dirname, '../..', '.env'), override: true });


import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import CodeJudge from './judge.js';
import { query } from './database/db-postgres.js';
import { battleTimeoutQueue } from './queue.js';


const connection = new IORedis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,   
    enableReadyCheck: false,
});

const judge = new CodeJudge();

const MAX_BATTLE_DURATION_MS = 2 * 60 * 1000; // 2 minutes

const worker = new Worker('judgeQueue', async (job) => {
  const { submissionId, userId, exerciseId, code, language, battleId } = job.data;

  console.log(`⚙️ Processing submission ${submissionId} for user ${userId} on ${exerciseId}${battleId ? ` (battle ${battleId})` : ''}`);

  // Update DB: status = running (using submissionId for accuracy)
  await query(`UPDATE submissions SET status = 'running' WHERE id = $1`,
    [submissionId]);

  const result = await judge.judgeSubmission(code, exerciseId);

  let status = 'failed';
  if (!result.compilationSuccess) status = 'compilation_error';
  else if (result.success) status = 'passed';

  // Ensure compilationSuccess is explicitly set (not null)
  const compilationSuccess = result.compilationSuccess === true;

  await query(
    `UPDATE submissions 
     SET status = $1, compilation_success = $2, compilation_error = $3, test_results = $4 
     WHERE id = $5`,
    [
      status,
      compilationSuccess,
      result.compilationError || null,
      JSON.stringify(result.testResults || []),
      submissionId
    ]
  );

  console.log(`✅ Submission ${submissionId} done (${status}, compilation: ${compilationSuccess})`);

  if (battleId) {
    try {
      await processBattleIfReady(battleId);
    } catch (error) {
      console.error(`Error processing battle ${battleId}:`, error);
    }
  }
}, { connection, concurrency: 3 }); // can handle 3 submissions at once

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});

// Battle timeout worker - handles timeout jobs
const timeoutWorker = new Worker('battleTimeoutQueue', async (job) => {
  const { battleId } = job.data;
  console.log(`⏱️ Battle ${battleId} timeout job triggered. Processing...`);
  
  try {
    await processBattleIfReady(battleId);
  } catch (error) {
    console.error(`❌ Error processing timeout for battle ${battleId}:`, error);
    throw error;
  }
}, { connection, concurrency: 10 });

timeoutWorker.on('failed', (job, err) => {
  console.error(`❌ Battle timeout job ${job.id} failed:`, err);
});

async function scheduleBattleTimeout(battleId) {
  try {
    await battleTimeoutQueue.add(
      'timeout',
      { battleId },
      { 
        delay: MAX_BATTLE_DURATION_MS,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      }
    );
    console.log(`📅 Battle ${battleId} timeout scheduled for ${MAX_BATTLE_DURATION_MS / 1000 / 60} minutes`);
  } catch (error) {
    console.error(`Failed to schedule timeout for battle ${battleId}:`, error);
  }
}

async function processBattleIfReady(battleId) {
  const battleResult = await query(
    'SELECT * FROM battles WHERE id = $1',
    [battleId]
  );

  if (battleResult.rows.length === 0) return;

  const battle = battleResult.rows[0];
  if (battle.status !== 'active') return;

  const startedAtMs = battle.started_at
    ? new Date(battle.started_at).getTime()
    : Date.now();
  const nowMs = Date.now();
  const elapsedMs = nowMs - startedAtMs;
  const timedOut = elapsedMs >= MAX_BATTLE_DURATION_MS;

  const ids = [];
  if (battle.player1_submission_id) ids.push(battle.player1_submission_id);
  if (battle.player2_submission_id) ids.push(battle.player2_submission_id);

  if (ids.length === 0) {
    if (!timedOut) {
      console.log(`⏳ Battle ${battleId} waiting for first submission`);
      return;
    }
    // Timed out with no submissions at all → treat as draw with zero performance
    const fakeStats1 = {
      submissionId: 0,
      userId: battle.player1_id,
      status: 'failed',
      passed: false,
      correctness: 0,
      passedCases: 0,
      totalCases: 1,
      durationMs: MAX_BATTLE_DURATION_MS,
    };
    const fakeStats2 = {
      ...fakeStats1,
      userId: battle.player2_id,
    };

    const maxDuration = MAX_BATTLE_DURATION_MS;
    const perf1 = finalizePerformance(fakeStats1, maxDuration);
    const perf2 = finalizePerformance(fakeStats2, maxDuration);

    const outcome = {
      winnerId: null,
      status: 'completed',
      playerResults: new Map([
        [battle.player1_id, 'draw'],
        [battle.player2_id, 'draw'],
      ]),
    }; 

    await finalizeBattleAndRatings(battle, battleId, outcome, perf1, perf2);
    return;
  }

  const submissionsResult = await query(
    'SELECT * FROM submissions WHERE id = ANY($1)',
    [ids]
  );

  const submissionsMap = new Map(submissionsResult.rows.map((row) => [row.id, row]));
  const submission1 = battle.player1_submission_id
    ? submissionsMap.get(battle.player1_submission_id)
    : null;
  const submission2 = battle.player2_submission_id
    ? submissionsMap.get(battle.player2_submission_id)
    : null;

  // Case 1: both players have submitted
  if (submission1 && submission2) {
    const stats1 = buildSubmissionStats(submission1, battle.started_at);
    const stats2 = buildSubmissionStats(submission2, battle.started_at);

    const maxDuration = Math.max(stats1.durationMs, stats2.durationMs, 1);
    const perf1 = finalizePerformance(stats1, maxDuration);
    const perf2 = finalizePerformance(stats2, maxDuration);

    const somePassed =
      submission1.status === 'passed' || submission2.status === 'passed';

    // If someone passed before timeout, resolve normally using pass/time rules.
    if (somePassed && !timedOut) {
      const outcome = determineBattleOutcome(battle, submission1, submission2);
      await finalizeBattleAndRatings(battle, battleId, outcome, perf1, perf2);
      return;
    }

    // At timeout, or if no one passed, decide winner by:
    // 1) more passed testcases
    // 2) if equal > 0, earlier submit time
    // 3) draw only if both have 0 passed cases
    if (!timedOut) {
      // Not timed out yet & no one has fully passed -> let them keep submitting
      console.log(
        `⏳ Battle ${battleId} has submissions from both players but no full pass yet – waiting or until timeout`
      );
      return;
    }

    const passed1 = stats1.passedCases;
    const passed2 = stats2.passedCases;

    let winnerId = null;
    const playerResults = new Map([
      [battle.player1_id, 'draw'],
      [battle.player2_id, 'draw'],
    ]);

    if (passed1 > passed2) {
      winnerId = battle.player1_id;
      playerResults.set(battle.player1_id, 'win');
      playerResults.set(battle.player2_id, 'loss');
    } else if (passed2 > passed1) {
      winnerId = battle.player2_id;
      playerResults.set(battle.player1_id, 'loss');
      playerResults.set(battle.player2_id, 'win');
    } else if (passed1 === 0 && passed2 === 0) {
      // explicit draw: nobody passed any testcase
      winnerId = null;
    } else {
      // same non-zero passedCases: tie-break by earlier submit time
      const t1 = submission1.submitted_at
        ? new Date(submission1.submitted_at).getTime()
        : Number.MAX_SAFE_INTEGER;
      const t2 = submission2.submitted_at
        ? new Date(submission2.submitted_at).getTime()
        : Number.MAX_SAFE_INTEGER;

      if (t1 < t2) {
        winnerId = battle.player1_id;
        playerResults.set(battle.player1_id, 'win');
        playerResults.set(battle.player2_id, 'loss');
      } else if (t2 < t1) {
        winnerId = battle.player2_id;
        playerResults.set(battle.player1_id, 'loss');
        playerResults.set(battle.player2_id, 'win');
      } else {
        // identical times: treat as draw
        winnerId = null;
      }
    }

    const outcome = {
      winnerId,
      status: 'completed',
      playerResults,
    };

    await finalizeBattleAndRatings(battle, battleId, outcome, perf1, perf2);
    return;
  }

  // Case 2: only one player has submitted.
  const singleSubmission = submission1 || submission2;
  if (!singleSubmission) {
    console.log(`⚠️ Battle ${battleId} submissions not fully recorded yet`);
    return;
  }

  // If the single submission passed, the submitting player wins immediately (even before timeout)
  if (singleSubmission.status === 'passed') {
    const singleIsPlayer1 = !!submission1;

    const realStats = buildSubmissionStats(singleSubmission, battle.started_at);

    const fakeStatsBase = {
      submissionId: 0,
      userId: singleIsPlayer1 ? battle.player2_id : battle.player1_id,
      status: 'failed',
      passed: false,
      correctness: 0,
      passedCases: 0,
      totalCases: realStats.totalCases,
      durationMs: realStats.durationMs * 2,
    };

    let stats1;
    let stats2;
    let outcome;

    if (singleIsPlayer1) {
      stats1 = realStats;
      stats2 = fakeStatsBase;
      outcome = determineBattleOutcome(battle, singleSubmission, {
        id: 0,
        user_id: battle.player2_id,
        status: 'failed',
        submitted_at: null,
      });
    } else {
      stats1 = fakeStatsBase;
      stats2 = realStats;
      outcome = determineBattleOutcome(battle, {
        id: 0,
        user_id: battle.player1_id,
        status: 'failed',
        submitted_at: null,
      }, singleSubmission);
    }

    const maxDuration = Math.max(stats1.durationMs, stats2.durationMs, 1);
    const perf1 = finalizePerformance(stats1, maxDuration);
    const perf2 = finalizePerformance(stats2, maxDuration);

    await finalizeBattleAndRatings(battle, battleId, outcome, perf1, perf2);
    return;
  }

  // Single submission, not passed. If we've hit the 15 minute limit, end as timeout.
  if (!timedOut) {
    console.log(`⏳ Battle ${battleId} has one submission but not passed yet – waiting for opponent or future pass`);
    return;
  }

  const singleIsPlayer1 = !!submission1;

  // Build stats for the submitting player
  const realStats = buildSubmissionStats(singleSubmission, battle.started_at);

  // Opponent has no submission, so effectively 0 passed testcases
  const opponentUserId = singleIsPlayer1 ? battle.player2_id : battle.player1_id;

  const fakeStatsBase = {
    submissionId: 0,
    userId: opponentUserId,
    status: 'failed',
    passed: false,
    correctness: 0,
    passedCases: 0,
    totalCases: realStats.totalCases,
    durationMs: MAX_BATTLE_DURATION_MS,
  };

  let stats1;
  let stats2;
  let playerResults = new Map([
    [battle.player1_id, 'draw'],
    [battle.player2_id, 'draw'],
  ]);
  let winnerId = null;

  if (singleIsPlayer1) {
    stats1 = realStats;
    stats2 = fakeStatsBase;

    if (realStats.passedCases > 0) {
      winnerId = battle.player1_id;
      playerResults.set(battle.player1_id, 'win');
      playerResults.set(battle.player2_id, 'loss');
    }
  } else {
    stats1 = fakeStatsBase;
    stats2 = realStats;

    if (realStats.passedCases > 0) {
      winnerId = battle.player2_id;
      playerResults.set(battle.player1_id, 'loss');
      playerResults.set(battle.player2_id, 'win');
    }
  }

  // If realStats.passedCases == 0, winnerId stays null → draw (both 0 passed or opponent didn't submit).
  const outcome = {
    winnerId,
    status: 'completed',
    playerResults,
  };

  const maxDuration = Math.max(stats1.durationMs, stats2.durationMs, 1);
  const perf1 = finalizePerformance(stats1, maxDuration);
  const perf2 = finalizePerformance(stats2, maxDuration);

  await finalizeBattleAndRatings(battle, battleId, outcome, perf1, perf2);
}

async function finalizeBattleAndRatings(battle, battleId, outcome, perf1, perf2) {
  await query(
    `UPDATE battles 
     SET status = $1, winner_id = $2, ended_at = CURRENT_TIMESTAMP 
     WHERE id = $3`,
    [outcome.status, outcome.winnerId, battleId]
  );

  // Mark both players' queue entries as completed (if they exist)
  await query(
    `UPDATE match_queue 
     SET status = 'completed' 
     WHERE user_id = ANY($1)`,
    [[battle.player1_id, battle.player2_id]]
  );

  console.log(`🏆 Battle ${battleId} completed. Winner: ${outcome.winnerId || 'Draw'}`);

  await updatePlayerRatings({
    battle,
    perf1,
    perf2,
    outcome,
  });
}

function buildSubmissionStats(submission, battleStart) {
  const testResultsRaw = submission.test_results;
  let testResults = [];

  if (Array.isArray(testResultsRaw)) {
    testResults = testResultsRaw;
  } else if (typeof testResultsRaw === 'string') {
    try {
      testResults = JSON.parse(testResultsRaw);
    } catch {
      testResults = [];
    }
  } else if (testResultsRaw && typeof testResultsRaw === 'object') {
    testResults = testResultsRaw;
  }

  const totalCases = testResults.length || 1;
  const passedCases = testResults.filter((t) => t.passed).length;
  const correctness = totalCases ? passedCases / totalCases : 0;

  const submittedAt = submission.submitted_at ? new Date(submission.submitted_at).getTime() : Date.now();
  const startedAt = battleStart ? new Date(battleStart).getTime() : submittedAt;
  const durationMs = Math.max(submittedAt - startedAt, 1);

  return {
    submissionId: submission.id,
    userId: submission.user_id,
    status: submission.status,
    passed: submission.status === 'passed',
    correctness,
    passedCases,
    totalCases,
    durationMs,
  };
}

function finalizePerformance(stats, maxDuration) {
  // Cap the effective duration so everything beyond 15 minutes is treated equally
  const cappedMax = Math.max(1, Math.min(maxDuration, MAX_BATTLE_DURATION_MS));
  const effectiveDuration = Math.min(stats.durationMs, cappedMax);
  const speedTerm = clamp(1 - effectiveDuration / cappedMax, 0, 1);
  const performance = clamp(0.8 * stats.correctness + 0.2 * speedTerm, 0, 1);
  return { ...stats, speedTerm, performance };
}

function determineBattleOutcome(battle, submission1, submission2) {
  let winnerId = null;
  let status = 'completed';
  const playerResults = new Map([
    [battle.player1_id, 'draw'],
    [battle.player2_id, 'draw'],
  ]);

  if (submission1.status === 'passed' && submission2.status === 'passed') {
    const time1 = submission1.submitted_at ? new Date(submission1.submitted_at).getTime() : 0;
    const time2 = submission2.submitted_at ? new Date(submission2.submitted_at).getTime() : 0;
    if (time1 < time2) {
      winnerId = battle.player1_id;
      playerResults.set(battle.player1_id, 'win');
      playerResults.set(battle.player2_id, 'loss');
    } else if (time2 < time1) {
      winnerId = battle.player2_id;
      playerResults.set(battle.player1_id, 'loss');
      playerResults.set(battle.player2_id, 'win');
    }
  } else if (submission1.status === 'passed') {
    winnerId = battle.player1_id;
    playerResults.set(battle.player1_id, 'win');
    playerResults.set(battle.player2_id, 'loss');
  } else if (submission2.status === 'passed') {
    winnerId = battle.player2_id;
    playerResults.set(battle.player1_id, 'loss');
    playerResults.set(battle.player2_id, 'win');
  }

  return { winnerId, status, playerResults };
}

async function updatePlayerRatings({ battle, perf1, perf2, outcome }) {
  const playersResult = await query(
    'SELECT id, rating, win_streak, loss_streak FROM users WHERE id = ANY($1)',
    [[battle.player1_id, battle.player2_id]]
  );

  if (playersResult.rowCount < 2) {
    console.error(`⚠️ Unable to load player ratings for battle ${battle.id}`);
    return;
  }

  const playerMap = new Map(playersResult.rows.map((row) => [row.id, row]));
  const player1 = playerMap.get(battle.player1_id);
  const player2 = playerMap.get(battle.player2_id);
  if (!player1 || !player2) return;

  const exerciseDifficulty = await getExerciseDifficulty(battle.exercise_id);

  const perfSum = perf1.performance + perf2.performance;
  const share1 = perfSum <= 0 ? 0.5 : perf1.performance / perfSum;
  const share2 = 1 - share1;

  const expected1 = getExpectedScore(player1.rating, player2.rating);
  const expected2 = 1 - expected1;

  const difficultyBonus1 = getDifficultyBonus(player1.rating, exerciseDifficulty, perf1.passed);
  const difficultyBonus2 = getDifficultyBonus(player2.rating, exerciseDifficulty, perf2.passed);

  const k1 = computeKFactor(player1.win_streak, player1.loss_streak, difficultyBonus1);
  const k2 = computeKFactor(player2.win_streak, player2.loss_streak, difficultyBonus2);

  const delta1 = finalizeDelta(k1 * (share1 - expected1), outcome.playerResults.get(player1.id));
  const delta2 = finalizeDelta(k2 * (share2 - expected2), outcome.playerResults.get(player2.id));

  const ratingFloor = 200;
  const newRating1 = Math.max(ratingFloor, player1.rating + delta1);
  const newRating2 = Math.max(ratingFloor, player2.rating + delta2);

  const streaks1 = nextStreaks(player1.win_streak, player1.loss_streak, outcome.playerResults.get(player1.id));
  const streaks2 = nextStreaks(player2.win_streak, player2.loss_streak, outcome.playerResults.get(player2.id));

  await query(
    `UPDATE users SET rating = $1, win_streak = $2, loss_streak = $3, k_factor = $4 WHERE id = $5`,
    [newRating1, streaks1.winStreak, streaks1.lossStreak, Math.round(k1), player1.id]
  );

  await query(
    `UPDATE users SET rating = $1, win_streak = $2, loss_streak = $3, k_factor = $4 WHERE id = $5`,
    [newRating2, streaks2.winStreak, streaks2.lossStreak, Math.round(k2), player2.id]
  );

  console.log(
    `📈 Ratings updated: Player ${player1.id} ${player1.rating}→${newRating1} (${delta1 >= 0 ? '+' : ''}${delta1}), ` +
    `Player ${player2.id} ${player2.rating}→${newRating2} (${delta2 >= 0 ? '+' : ''}${delta2})`
  );
}

function getExpectedScore(ratingA, ratingB) {
  const diff = (ratingB - ratingA) / 400;
  return 1 / (1 + Math.pow(10, diff));
}

function computeKFactor(winStreak, lossStreak, difficultyBonus = 0) {
  const BASE = 40;
  const MIN = 20;
  const MAX = 50;
  const streakBonus = Math.min(Math.floor(winStreak / 4) * 10, 20);
  // Loss penalty: -5 for every 2 consecutive losses (per spec)
  const lossPenalty = Math.floor(lossStreak / 2) * 5;
  const raw = BASE + streakBonus - lossPenalty + difficultyBonus;
  return clamp(raw, MIN, MAX);
}

function getDifficultyBonus(rating, difficulty, solved) {
  if (!solved) return 0;
  const diff = difficulty.toLowerCase();
  if (rating < 350) {
    if (diff === 'medium') return 5;
    if (diff === 'hard') return 10;
  }
  if (rating > 550) {
    if (diff === 'easy') return -5;
    if (diff === 'medium') return -2;
  }
  return 0;
}

function finalizeDelta(deltaFloat, result = 'draw') {
  // Draws should not change ratings according to the rules.
  if (result === 'draw') return 0;

  let delta = Math.round(deltaFloat);
  if (result === 'win' && delta < 1) delta = 1;
  if (result === 'loss' && delta > -1) delta = -1;
  return delta;
}

function nextStreaks(winStreak, lossStreak, result = 'draw') {
  if (result === 'win') {
    return { winStreak: winStreak + 1, lossStreak: 0 };
  }
  if (result === 'loss') {
    return { winStreak: 0, lossStreak: lossStreak + 1 };
  }
  return { winStreak: 0, lossStreak: 0 };
}

async function getExerciseDifficulty(exerciseId) {
  try {
    // From backend/src to backend/exercises
    const exercisesDir = path.join(__dirname, '..', 'exercises');
    const configPath = path.join(exercisesDir, exerciseId, 'config.json');
    const configContent = await fs.promises.readFile(configPath, 'utf8');
    const config = JSON.parse(configContent);
    return (config.difficulty || 'medium').toLowerCase();
  } catch {
    return 'medium';
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
