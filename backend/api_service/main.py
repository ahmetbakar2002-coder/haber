import asyncio
from fastapi import FastAPI
import uvicorn
from core.logger import logger
from prometheus_client import make_asgi_app

app = FastAPI(title="ÇAKÜ Spor API Service")

# Setup metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting API Fetching Service...")
    # Background task for api clients would start here
    # e.g., asyncio.create_task(api_football_client.start_polling())

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down API Service...")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api_service"}

if __name__ == "__main__":
    uvicorn.run("api_service.main:app", host="0.0.0.0", port=8002, reload=False)
