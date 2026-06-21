import aio_pika
from core.config import settings
from core.logger import logger

async def get_rabbitmq_connection() -> aio_pika.RobustConnection:
    logger.info("Connecting to RabbitMQ...")
    connection = await aio_pika.connect_robust(
        settings.RABBITMQ_URL,
        client_properties={"connection_name": "caku_newsroom"}
    )
    return connection

async def setup_queues(channel: aio_pika.abc.AbstractChannel):
    """Declare exchanges and queues with DLQ setup."""
    
    # Dead Letter Exchange
    dlx = await channel.declare_exchange("dlx", aio_pika.ExchangeType.DIRECT)
    dlq = await channel.declare_queue("dead-letter", durable=True)
    await dlq.bind(dlx, routing_key="dead-letter")

    # Main News Exchange
    news_exchange = await channel.declare_exchange("news", aio_pika.ExchangeType.TOPIC)
    
    # Queues with Dead Letter config
    queues = [
        "raw-news",
        "verified-news",
        "translated-news",
        "classified-news",
        "ready-to-publish"
    ]
    
    for q_name in queues:
        # Priority queue with DLX
        queue = await channel.declare_queue(
            q_name, 
            durable=True,
            arguments={
                "x-max-priority": 10,
                "x-dead-letter-exchange": "dlx",
                "x-dead-letter-routing-key": "dead-letter"
            }
        )
        await queue.bind(news_exchange, routing_key=f"news.{q_name}")
        logger.info(f"Queue setup completed for {q_name}")
