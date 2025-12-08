import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../..', '.env'), override: true });

import { Worker, Queue } from 'bullmq';
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

const MAX_BATTLE_DURATION_MS = 2 * 60 * 1000; // 2 minutes

// Matching worker that processes match requests and pairs players
const matchWorker = new Worker('matchQueue', async (job) => {
  const { userId } = job.data;

  console.log(`🔍 Processing match request for user ${userId}`);

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
      console.log(`⚠️ User ${userId} no longer in queue, skipping match`);
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
      console.log(`⏳ No opponent found for user ${userId}, will retry...`);
      // Re-queue the job with a delay (retry after 5 seconds)
      throw new Error('No opponent found');
    }

    const opponent = opponentResult.rows[0];
    const opponentId = opponent.user_id;
    const opponentRating = opponent.rating ?? 400;

    const averageRating = (playerRating + opponentRating) / 2;
    const primaryDifficulty = pickDifficultyForRating(averageRating);

    // From backend/src to backend/exercises
    const exercisesDir = path.join(__dirname, '..', 'exercises');
    const exerciseId = await selectExerciseForDifficulty(exercisesDir, averageRating, primaryDifficulty);

    if (!exerciseId) {
      console.error(`❌ No exercises available for selected difficulty mix (avg rating ${averageRating})`);
      await query('UPDATE match_queue SET status = $1 WHERE user_id IN ($2, $3)', 
        ['cancelled', userId, opponentId]);
      return;
    }

    // Create battle record
    const battleResult = await query(
      `INSERT INTO battles (player1_id, player2_id, exercise_id, status, started_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, opponentId, exerciseId, 'active']
    );

    const battleId = battleResult.rows[0].id;

    // Schedule timeout job for this battle with a deterministic job ID
    const timeoutJobId = `battle-timeout:${battleId}`;
    await battleTimeoutQueue.add(
      'timeout',
      { battleId },
      { 
        jobId: timeoutJobId,
        delay: MAX_BATTLE_DURATION_MS,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      }
    );
    console.log(`📅 Battle ${battleId} timeout scheduled (job ${timeoutJobId}) for ${MAX_BATTLE_DURATION_MS / 1000 / 60} minutes`);

    // Update both players' queue status to 'matched'
    await query(
      'UPDATE match_queue SET status = $1 WHERE user_id IN ($2, $3)',
      ['matched', userId, opponentId]
    );

    const bucketLabel = getDifficultyBucket(averageRating).label;
    console.log(`✅ Matched user ${userId} (rating ${playerRating}) with ${opponentId} (rating ${opponentRating}) in battle ${battleId} (${bucketLabel}) → exercise ${exerciseId}`);

  } catch (error) {
    // If it's a "no opponent" error, we'll retry
    if (error.message === 'No opponent found') {
      throw error; // This will trigger BullMQ retry
    }
    console.error(`❌ Error matching user ${userId}:`, error);
    
    // Remove user from queue on error
    await query(
      'UPDATE match_queue SET status = $1 WHERE user_id = $2',
      ['cancelled', userId]
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
    // Retry after 5 seconds if no opponent found (up to 20 attempts)
    if (job.attemptsMade < 20) {
      const retryDelay = 5000;
      console.log(`🔄 Retrying match for user ${job.data.userId} in ${retryDelay}ms (attempt ${job.attemptsMade + 1}/20)`);
      
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
      console.log(`⏰ Match timeout for user ${job.data.userId} after 20 attempts`);
      // Remove from queue after max attempts
      await query(
        'UPDATE match_queue SET status = $1 WHERE user_id = $2',
        ['cancelled', job.data.userId]
      );
    }
  } else {
    console.error(`❌ Match job ${job.id} failed:`, err);
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

console.log('🎮 Match worker started');

