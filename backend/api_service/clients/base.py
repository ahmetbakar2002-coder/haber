import httpx
import hashlib
import asyncio
from typing import Dict, Any, List
from core.logger import logger
from api_service.circuit_breaker import CircuitBreaker
from api_service.rate_limiter import RateLimiter
from core.metrics import API_REQUEST_DURATION

class BaseAPIClient:
    def __init__(self, base_url: str, api_name: str, rate_limit: int = 60, window: int = 60):
        self.base_url = base_url
        self.api_name = api_name
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=15.0)
        self.circuit_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60)
        self.rate_limiter = RateLimiter(key_prefix=api_name, max_requests=rate_limit, window_seconds=window)

    async def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[Any, Any]:
        await self.rate_limiter.acquire(identifier="global")
        
        with API_REQUEST_DURATION.labels(api_name=self.api_name).time():
            response = await self.client.request(method, endpoint, **kwargs)
            response.raise_for_status()
            return response.json()

    async def fetch(self, endpoint: str, **kwargs) -> Dict[Any, Any]:
        try:
            return await self.circuit_breaker.call(self._make_request, "GET", endpoint, **kwargs)
        except Exception as e:
            logger.error(f"API Fetch Error [{self.api_name}]: {str(e)}")
            return {}

    async def process_and_normalize(self) -> List[Dict]:
        """Should be overridden by specific client (e.g., APIFootballClient)"""
        raise NotImplementedError

    async def close(self):
        await self.client.aclose()
