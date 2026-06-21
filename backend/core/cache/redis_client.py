import redis.asyncio as redis
from core.config import settings

class RedisManager:
    def __init__(self):
        self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def get(self, key: str) -> str:
        return await self.client.get(key)

    async def set(self, key: str, value: str, ttl_seconds: int = None):
        await self.client.set(key, value, ex=ttl_seconds)
        
    async def set_exists(self, key: str) -> bool:
        return await self.client.exists(key) > 0

    async def increment(self, key: str, ttl_seconds: int = None) -> int:
        val = await self.client.incr(key)
        if ttl_seconds and val == 1:
            await self.client.expire(key, ttl_seconds)
        return val

redis_client = RedisManager()
