export { rawNewsWorker } from './raw';
export { rewriteNewsWorker } from './rewrite';
export { seoNewsWorker } from './seo';
export { publishNewsWorker } from './publish';

export function initWorkers() {
  console.log('All BullMQ Workers initialized and listening for jobs...');
}
