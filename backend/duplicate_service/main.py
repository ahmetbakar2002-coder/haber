import asyncio
from fastapi import FastAPI
import uvicorn
from core.logger import logger
from core.queue.consumer import Consumer
from core.queue.producer import Publisher
from duplicate_service.engine import DuplicateEngine
from core.metrics import ARTICLES_PROCESSED
from prometheus_client import make_asgi_app

app = FastAPI(title="ÇAKÜ Spor Duplicate Service")
engine = DuplicateEngine()
publisher = Publisher()

async def process_raw_news(message: dict):
    logger.info(f"Processing message: {message.get('title')}")
    
    is_dup = engine.check_duplicate(
        article_id=message.get("hash"),
        title=message.get("title", ""),
        summary=message.get("summary", "")
    )
    
    if is_dup:
        ARTICLES_PROCESSED.labels(status="duplicate").inc()
        # We could push it to a deleted/duplicate queue or just discard
    else:
        ARTICLES_PROCESSED.labels(status="success").inc()
        # Push to verified news
        await publisher.publish("verified-news", message)

consumer = Consumer(queue_name="raw-news", callback=process_raw_news)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Duplicate Engine Service...")
    asyncio.create_task(consumer.start())

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "duplicate_service"}

if __name__ == "__main__":
    uvicorn.run("duplicate_service.main:app", host="0.0.0.0", port=8003, reload=False)
