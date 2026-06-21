#!/bin/bash
# ÇAKÜ Spor AI Newsroom V7.0 - Kafka Topics Setup Script
# This script is meant to be run inside the Kafka broker container or externally using kafka-topics.sh

KAFKA_BROKER="localhost:9092"

echo "Creating Kafka topics for ÇAKÜ Spor Newsroom..."

# raw-news: High throughput, contains unverified and unchecked raw JSONs from RSS/APIs
# Partitions: 6 (to allow multiple duplicate-engine consumers)
# Retention: 24 hours (we don't need raw data for long)
kafka-topics.sh --create --bootstrap-server $KAFKA_BROKER \
    --replication-factor 1 --partitions 6 \
    --topic raw-news \
    --config retention.ms=86400000

# unique-news: Filtered news, duplicates removed.
# Partitions: 3
# Retention: 48 hours
kafka-topics.sh --create --bootstrap-server $KAFKA_BROKER \
    --replication-factor 1 --partitions 3 \
    --topic unique-news \
    --config retention.ms=172800000

# verified-news: Trusted news (score >= 70). Ready for NLP/Translation.
# Partitions: 3
# Retention: 48 hours
kafka-topics.sh --create --bootstrap-server $KAFKA_BROKER \
    --replication-factor 1 --partitions 3 \
    --topic verified-news \
    --config retention.ms=172800000

# ready-to-publish: Translated, SEO optimized, full JSONs.
# Partitions: 2
# Retention: 7 days (in case publishing service fails and needs to replay)
kafka-topics.sh --create --bootstrap-server $KAFKA_BROKER \
    --replication-factor 1 --partitions 2 \
    --topic ready-to-publish \
    --config retention.ms=604800000

# dead-letter-queue: Failed processings, unparsable messages
kafka-topics.sh --create --bootstrap-server $KAFKA_BROKER \
    --replication-factor 1 --partitions 1 \
    --topic dead-letter-queue \
    --config retention.ms=604800000

echo "Topics created successfully."
kafka-topics.sh --list --bootstrap-server $KAFKA_BROKER
