import time
import asyncio
from typing import Callable, Any
from core.logger import logger

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = "CLOSED" # CLOSED, OPEN, HALF_OPEN

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                logger.info("Circuit breaker entering HALF_OPEN state")
                self.state = "HALF_OPEN"
            else:
                raise Exception("Circuit Breaker is OPEN. Call blocked.")

        try:
            result = await func(*args, **kwargs)
            if self.state == "HALF_OPEN":
                logger.info("Circuit breaker recovered. state=CLOSED")
                self.state = "CLOSED"
                self.failure_count = 0
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            if self.failure_count >= self.failure_threshold:
                logger.error("Circuit breaker threshold reached. state=OPEN")
                self.state = "OPEN"
            raise e
