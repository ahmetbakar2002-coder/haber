import json
import aio_pika
from core.queue.connection import get_rabbitmq_connection

class Publisher:
    def __init__(self):
        self.connection = None
        self.channel = None
        self.exchange = None

    async def connect(self):
        if not self.connection:
            self.connection = await get_rabbitmq_connection()
            self.channel = await self.connection.channel()
            self.exchange = await self.channel.get_exchange("news")

    async def publish(self, routing_key: str, message: dict, priority: int = 0):
        await self.connect()
        
        msg = aio_pika.Message(
            body=json.dumps(message).encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            priority=priority,
            content_type="application/json"
        )
        
        await self.exchange.publish(msg, routing_key=f"news.{routing_key}")

    async def close(self):
        if self.connection:
            await self.connection.close()
