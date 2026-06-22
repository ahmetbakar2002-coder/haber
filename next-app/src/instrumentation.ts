export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initWorkers } = await import('./workers');
      await initWorkers();
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize workers. Redis or BullMQ issue:', error);
      // Don't throw, let the web server start so endpoints like /api/ping still work
    }
  }
}
