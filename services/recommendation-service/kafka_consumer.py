import os
import json
import logging
from threading import Thread
from confluent_kafka import Consumer, KafkaError
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:9092")
TOPIC = "ecommerce.product.created"

def consume_loop():
    conf = {
        'bootstrap.servers': KAFKA_BROKERS,
        'group.id': 'recommendation-group',
        'auto.offset.reset': 'earliest'
    }

    try:
        consumer = Consumer(conf)
        consumer.subscribe([TOPIC])
        logger.info(f"Subscribed to topic {TOPIC}")

        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    logger.error(msg.error())
                    break

            # Parse message
            try:
                payload = json.loads(msg.value().decode('utf-8'))
                event_data = payload.get('data', {})
                
                if 'id' in event_data and 'name' in event_data:
                    # Post to local FastAPI endpoint to update model
                    product = {
                        "id": event_data["id"],
                        "name": event_data["name"],
                        "category": event_data.get("categoryId", "Unknown"),
                        "description": event_data.get("description", "")
                    }
                    
                    try:
                        resp = requests.post("http://localhost:3011/api/v1/recommendations/products", json=product)
                        logger.info(f"Updated AI model with product {product['id']}: {resp.status_code}")
                    except requests.exceptions.RequestException as e:
                        logger.error(f"Failed to post to local API: {e}")

            except Exception as e:
                logger.error(f"Error parsing message: {e}")

    except Exception as e:
        logger.error(f"Kafka consumer failed: {e}")
    finally:
        consumer.close()

def start_kafka_consumer():
    thread = Thread(target=consume_loop, daemon=True)
    thread.start()
    logger.info("Kafka consumer thread started.")
