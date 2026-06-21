import json
import asyncio
import traceback
from typing import Callable, Awaitable
from core.queue.connection import get_rabbitmq_connection
from core.logger import logger
from core.exceptions import NewsroomException

class Consumer:
    def __init__(self, queue_name: str, callback: Callable[[dict], Awaitable[None]]):
        self.queue_name = queue_name
        self.callback = callback
        self.connection = None

    async def start(self):
        self.connection = await get_rabbitmq_connection()
        channel = await self.connection.channel()
        
        # Prefetch to prevent overwhelming the worker
        await channel.set_qos(prefetch_count=50)
        
        queue = await channel.get_queue(self.queue_name)
        
        logger.info(f"Started consuming from {self.queue_name}")
        
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process(ignore_processed=True):
                    try:
                        data = json.loads(message.body.decode())
                        await self.callback(data)
                        await message.ack()
                    except NewsroomException as e:
                        logger.warning(f"Business error in consumer: {e.message}")
                        # Reject and send to DLQ
                        await message.reject(requeue=False)
                    except Exception as e:
                        logger.error(f"Critical error processing message: {str(e)}")
                        logger.error(traceback.format_exc())
                        # If it's a random failure, we might want to requeue or DLQ. 
                        # Rejecting with requeue=False sends it to Dead Letter Exchange.
                        await message.reject(requeue=False)
