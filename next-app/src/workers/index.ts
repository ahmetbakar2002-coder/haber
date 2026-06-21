export { rawNewsWorker } from './raw';
export { rewriteNewsWorker } from './rewrite';
export { seoNewsWorker } from './seo';
export { publishNewsWorker } from './publish';
import { setupCronJobs } from './cron';
export { cronWorker, setupCronJobs } from './cron';

export async function initWorkers() {
  console.log('[Workers] Initialization started...');
  await setupCronJobs();
  // Workers auto-start when instantiated
  console.log('All BullMQ Workers initialized and listening for jobs...');
}
