import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null,   
    enableReadyCheck: false,
}); // connects to localhost:6379 by default
export const judgeQueue = new Queue('judgeQueue', { connection });
export const matchQueue = new Queue('matchQueue', { connection });
export const battleTimeoutQueue = new Queue('battleTimeoutQueue', { connection });
