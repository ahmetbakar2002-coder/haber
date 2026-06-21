import asyncio
from core.logger import logger
from rss_service.fetcher import RSSFetcher
from core.queue.producer import Publisher

# Temporary mock sources. In reality, these should be loaded from PostgreSQL `sources` table.
SOURCES = [
    {"id": "11111111-1111-1111-1111-111111111111", "url": "https://feeds.bbci.co.uk/sport/rss.xml"},
    {"id": "22222222-2222-2222-2222-222222222222", "url": "https://www.espn.com/espn/rss/news"},
]

class RSSScheduler:
    def __init__(self):
        self.publisher = Publisher()
        self.fetcher = RSSFetcher(self.publisher)
        self.running = False

    async def start(self, interval_seconds: int = 300):
        self.running = True
        logger.info("RSS Scheduler started.")
        
        while self.running:
            tasks = [
                self.fetcher.process_and_publish(src["id"], src["url"]) 
                for src in SOURCES
            ]
            
            # Run all fetches concurrently
            await asyncio.gather(*tasks, return_exceptions=True)
            
            logger.info(f"Sleeping for {interval_seconds} seconds...")
            await asyncio.sleep(interval_seconds)

    async def stop(self):
        self.running = False
        await self.fetcher.close()
        await self.publisher.close()
        logger.info("RSS Scheduler stopped.")
