import asyncio
import feedparser
import httpx
import hashlib
from typing import List, Dict
from core.logger import logger
from core.queue.producer import Publisher
from core.metrics import RSS_FETCH_DURATION

class RSSFetcher:
    def __init__(self, publisher: Publisher):
        self.publisher = publisher
        self.client = httpx.AsyncClient(timeout=10.0)

    async def fetch_feed(self, source_id: str, url: str) -> List[Dict]:
        logger.info(f"Fetching RSS feed from {url}")
        
        with RSS_FETCH_DURATION.labels(source_name=url).time():
            try:
                response = await self.client.get(url)
                response.raise_for_status()
                
                feed = feedparser.parse(response.content)
                articles = []
                
                for entry in feed.entries:
                    article_hash = hashlib.sha256(entry.link.encode()).hexdigest()
                    articles.append({
                        "source_id": source_id,
                        "title": entry.get("title", ""),
                        "url": entry.get("link", ""),
                        "summary": entry.get("summary", ""),
                        "hash": article_hash,
                        "published_at": entry.get("published", None)
                    })
                
                logger.info(f"Successfully fetched {len(articles)} articles from {url}")
                return articles
                
            except Exception as e:
                logger.error(f"Error fetching {url}: {str(e)}")
                return []

    async def process_and_publish(self, source_id: str, url: str):
        articles = await self.fetch_feed(source_id, url)
        for article in articles:
            await self.publisher.publish("raw-news", article)
        
    async def close(self):
        await self.client.aclose()
