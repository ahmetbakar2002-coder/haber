import asyncio
from fastapi import FastAPI
import uvicorn
from core.logger import logger
from rss_service.scheduler import RSSScheduler
from prometheus_client import make_asgi_app

app = FastAPI(title="ÇAKÜ Spor RSS Service")
scheduler = RSSScheduler()

# Add prometheus asgi middleware to route /metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting RSS Service...")
    # Start scheduler as a background task
    asyncio.create_task(scheduler.start(interval_seconds=60))

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down RSS Service...")
    await scheduler.stop()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "rss_service"}

if __name__ == "__main__":
    uvicorn.run("rss_service.main:app", host="0.0.0.0", port=8001, reload=False)
