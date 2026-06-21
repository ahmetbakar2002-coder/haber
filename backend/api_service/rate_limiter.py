import time
from core.cache.redis_client import redis_client
from core.logger import logger
from core.exceptions import NewsroomException

class RateLimiter:
    def __init__(self, key_prefix: str, max_requests: int, window_seconds: int):
        self.key_prefix = key_prefix
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def check_limit(self, identifier: str = "default") -> bool:
        """
        Token bucket or simple window rate limiter using Redis.
        Returns True if allowed, False if limited.
        """
        current_minute = int(time.time() / self.window_seconds)
        redis_key = f"rate_limit:{self.key_prefix}:{identifier}:{current_minute}"
        
        current_requests = await redis_client.increment(redis_key, ttl_seconds=self.window_seconds * 2)
        
        if current_requests > self.max_requests:
            logger.warning(f"Rate limit exceeded for {self.key_prefix}")
            return False
            
        return True

    async def acquire(self, identifier: str = "default"):
        """Waits asynchronously until a slot is available (Not suitable for very strict delays without a loop)"""
        while not await self.check_limit(identifier):
            await asyncio.sleep(1)
