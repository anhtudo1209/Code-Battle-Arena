import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../..', '.env'), override: true });

import BullMQPkg from 'bullmq';
const { Worker, Queue } = BullMQPkg;
import IORedis from 'ioredis';
import { query } from './database/db-postgres.js';
import { pickDifficultyForRating, getDifficultyBucket, getMaxRatingDifference } from './utils/matchmaking.js';
import { battleTimeoutQueue } from './queue.js';

const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const MAX_BATTLE_DURATION_MS = 20 * 60 * 1000; // 20 minutes

// Matching worker that processes match requests and pairs players
const matchWorker = new Worker('matchQueue', async (job) => {
  const { userId } = job.data;

  console.log(`Processing match request for user ${userId}`);

  try {
    // Check if user is still in queue and get rating
    const playerResult = await query(
      `SELECT mq.queued_at, u.rating 
       FROM match_queue mq 
       JOIN users u ON u.id = mq.user_id 
       WHERE mq.user_id = $1 AND mq.status = $2`,
      [userId, 'waiting']
    );

    if (playerResult.rows.length === 0) {
      console.log(`User ${userId} no longer in queue, skipping match`);
      return;
    }

    const playerQueuedAt = new Date(playerResult.rows[0].queued_at);
    const playerRating = playerResult.rows[0].rating ?? 400;
    const waitedMs = Date.now() - playerQueuedAt.getTime();
    const allowedDiff = getMaxRatingDifference(waitedMs);

    // Find another player within the allowed rating difference
    const opponentResult = await query(
      `SELECT mq.user_id, mq.queued_at, u.rating 
       FROM match_queue mq
       JOIN users u ON u.id = mq.user_id
       WHERE mq.user_id != $1 
       AND mq.status = $2 
       AND ABS(u.rating - $3) <= $4
       ORDER BY queued_at ASC 
       LIMIT 1`,
      [userId, 'waiting', playerRating, allowedDiff]
    );

    if (opponentResult.rows.length === 0) {
      console.log(`No opponent found for user ${userId}, will retry...`);
      // Re-queue the job with a delay (retry after 5 seconds)
      throw new Error('No opponent found');
    }

    const opponent = opponentResult.rows[0];
    const opponentId = opponent.user_id;
    const opponentRating = opponent.rating ?? 400;

    // Double-check both players are still waiting (prevent race condition)
    const bothStillWaiting = await query(
      `SELECT COUNT(*) as count FROM match_queue 
       WHERE user_id IN ($1, $2) AND status = 'waiting'`,
      [userId, opponentId]
    );

    if (bothStillWaiting.rows[0].count !== '2') {
      console.log(`User ${userId} or ${opponentId} already matched by another worker, skipping`);
      return; // Other worker handled it, just exit cleanly
    }

    const averageRating = (playerRating + opponentRating) / 2;
    const primaryDifficulty = pickDifficultyForRating(averageRating);

    // From backend/src to backend/exercises
    const exercisesDir = path.join(__dirname, '..', 'exercises');
    const exerciseId = await selectExerciseForDifficulty(exercisesDir, averageRating, primaryDifficulty);

    if (!exerciseId) {
      console.error(`No exercises available for selected difficulty mix (avg rating ${averageRating})`);
      await query('UPDATE match_queue SET status = $1 WHERE user_id IN ($2, $3) AND status = $4',
        ['cancelled', userId, opponentId, 'waiting']);
      return;
    }

    // Use a transaction to atomically create battle and update queue statuses
    await query('BEGIN');
    try {
      // Create battle record in 'pending' state while we wait for acceptances
      // Explicitly set created_at to UTC to avoid timezone issues
      const battleResult = await query(
        `INSERT INTO battles (player1_id, player2_id, exercise_id, status, created_at)
       VALUES ($1, $2, $3, $4, NOW() AT TIME ZONE 'UTC')
       RETURNING id, created_at`,
        [userId, opponentId, exerciseId, 'pending']
      );

      const battleId = battleResult.rows[0].id;

      // Update both players' queue status to 'matched' (atomically)
      const updateResult = await query(
        `UPDATE match_queue SET status = $1 
         WHERE user_id IN ($2, $3) AND status = $4
         RETURNING user_id`,
        ['matched', userId, opponentId, 'waiting']
      );

      // Verify both were updated
      if (updateResult.rows.length !== 2) {
        await query('ROLLBACK');
        console.log(`Race condition: only ${updateResult.rows.length}/2 players updated, another worker may have matched them`);
        return;
      }

      await query('COMMIT');

      // Schedule accept timeout job (20s) so pending match expires if not accepted
      // Do this AFTER commit so battle definitely exists
      const acceptJobId = `battle-accept-${battleId}`;
      try {
        await battleTimeoutQueue.add(
          'accept',
          { battleId },
          {
            jobId: acceptJobId,
            delay: 20 * 1000, // 20 seconds to accept
            attempts: 1
          }
        );
        console.log(`Battle ${battleId} accept window scheduled (job ${acceptJobId}) for 20 seconds`);
      } catch (queueError) {
        // If queue add fails, log but don't fail the match (battle is already created)
        console.error(`Failed to schedule accept timeout for battle ${battleId}:`, queueError.message || queueError);
        // Battle still exists, players can accept manually, but timeout won't work
      }

      const bucketLabel = getDifficultyBucket(averageRating).label;
      console.log(`Matched user ${userId} (rating ${playerRating}) with ${opponentId} (rating ${opponentRating}) in battle ${battleId} (${bucketLabel}) → exercise ${exerciseId}`);
    } catch (dbError) {
      await query('ROLLBACK');
      throw dbError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    // If it's a "no opponent" error, we'll retry
    if (error.message === 'No opponent found') {
      throw error; // This will trigger BullMQ retry
    }

    // Check if user was already matched by another worker (race condition)
    const currentStatus = await query(
      'SELECT status FROM match_queue WHERE user_id = $1',
      [userId]
    );

    if (currentStatus.rows.length > 0 && currentStatus.rows[0].status === 'matched') {
      console.log(`User ${userId} was already matched by another worker, ignoring error`);
      return; // Don't cancel, they're already matched
    }

    console.error(`Error matching user ${userId}:`, error);

    // Only cancel if user is still waiting (not already matched/cancelled)
    await query(
      'UPDATE match_queue SET status = $1 WHERE user_id = $2 AND status = $3',
      ['cancelled', userId, 'waiting']
    );
  }
}, {
  connection,
  concurrency: 5, // Can handle 5 match requests at once
  limiter: {
    max: 10, // Max 10 jobs
    duration: 5000, // per 5 seconds
  }
});

// Create match queue instance for retries
const matchQueue = new Queue('matchQueue', { connection });

// Retry configuration for "no opponent found" cases
matchWorker.on('failed', async (job, err) => {
  if (err.message === 'No opponent found') {
    // Retry infinitely every 1 second if no opponent found
    const retryDelay = 1000;
    console.log(`Retrying match for user ${job.data.userId} in ${retryDelay}ms...`);

    // Re-add job with delay
    await matchQueue.add('match', job.data, {
      delay: retryDelay,
      attempts: job.attemptsMade + 1,
      backoff: {
        type: 'fixed',
        delay: retryDelay
      }
    });
  } else {
    console.error(`Match job ${job.id} failed:`, err);
  }
});

async function selectExerciseForDifficulty(exercisesDir, avgRating, preferredDifficulty) {
  const seenDiffs = new Set();
  const bucket = getDifficultyBucket(avgRating);
  const orderedDiffs = Object.entries(bucket.weights)
    .sort(([, wA], [, wB]) => wB - wA)
    .map(([diff]) => diff);

  const difficultiesToTry = [preferredDifficulty, ...orderedDiffs, 'easy', 'medium', 'hard']
    .filter((diff) => {
      const key = diff.toLowerCase();
      if (seenDiffs.has(key)) return false;
      seenDiffs.add(key);
      return true;
    });

  for (const difficulty of difficultiesToTry) {
    const pool = await getExercisesByDifficulty(exercisesDir, difficulty);
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  return null;
}

async function getExercisesByDifficulty(exercisesDir, difficulty) {
  const normalizedDiff = difficulty.toLowerCase();
  const folders = await fs.promises.readdir(exercisesDir, { withFileTypes: true });
  const matches = [];

  for (const folder of folders) {
    if (!folder.isDirectory()) continue;
    const exerciseId = folder.name;
    const configPath = path.join(exercisesDir, exerciseId, 'config.json');

    try {
      const configContent = await fs.promises.readFile(configPath, 'utf8');
      const config = JSON.parse(configContent);
      if ((config.difficulty || '').toLowerCase() === normalizedDiff) {
        matches.push(exerciseId);
      }
    } catch {
      continue;
    }
  }

  return matches;
}

console.log('Match worker started');

