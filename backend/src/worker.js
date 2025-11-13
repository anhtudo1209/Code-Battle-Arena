import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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


const connection = new IORedis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,   
    enableReadyCheck: false,
});

const judge = new CodeJudge();

const worker = new Worker('judgeQueue', async (job) => {
  const { submissionId, userId, exerciseId, code, language } = job.data;

  console.log(`⚙️ Processing submission ${submissionId} for user ${userId} on ${exerciseId}`);

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
}, { connection, concurrency: 3 }); // can handle 3 submissions at once

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});
