import os
import json
import hashlib
import redis
from confluent_kafka import Consumer, Producer

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

# Redis client for quick duplicate checking (hash-based)
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

def generate_hash(text: str) -> str:
    """Generate SHA256 hash for similarity matching."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def is_duplicate(news_hash: str) -> bool:
    """Check if hash exists in Redis (1 day TTL)."""
    if redis_client.exists(f"news_hash:{news_hash}"):
        return True
    return False

def mark_as_processed(news_hash: str):
    """Save hash to Redis with 24 hours TTL."""
    redis_client.setex(f"news_hash:{news_hash}", 86400, "1")

def main():
    print("Starting Duplicate Engine...")

    # Setup Consumer for raw-news
    conf_c = {
        'bootstrap.servers': KAFKA_BROKERS,
        'group.id': 'duplicate-engine-group',
        'auto.offset.reset': 'earliest'
    }
    consumer = Consumer(conf_c)
    consumer.subscribe(['raw-news'])

    # Setup Producer for unique-news
    conf_p = {'bootstrap.servers': KAFKA_BROKERS}
    producer = Producer(conf_p)

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Consumer error: {msg.error()}")
                continue

            try:
                # Parse incoming message
                raw_data = json.loads(msg.value().decode('utf-8'))
                
                # Combine title and content to generate unique hash
                content_to_hash = raw_data.get('title', '') + raw_data.get('content', '')
                news_hash = generate_hash(content_to_hash)

                if is_duplicate(news_hash):
                    print(f"DUPLICATE DETECTED: {raw_data.get('title')} (Source: {raw_data.get('source')})")
                    # Set update_existing flag
                    raw_data['update_existing'] = True
                    # Here we could send it to a different topic or just log
                else:
                    print(f"UNIQUE NEWS: {raw_data.get('title')} (Source: {raw_data.get('source')})")
                    raw_data['update_existing'] = False
                    mark_as_processed(news_hash)
                    
                    # Forward to unique-news
                    producer.produce('unique-news', value=json.dumps(raw_data).encode('utf-8'))
                    producer.poll(0)
            
            except Exception as e:
                print(f"Error processing message: {e}")

    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()
        producer.flush()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
