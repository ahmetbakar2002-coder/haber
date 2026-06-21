from prometheus_client import Counter, Histogram, Gauge

# Fetch metrics
RSS_FETCH_DURATION = Histogram(
    "rss_fetch_duration_seconds", 
    "Time spent fetching and parsing RSS feeds",
    ["source_name"]
)

API_REQUEST_DURATION = Histogram(
    "api_request_duration_seconds", 
    "Time spent fetching from API endpoints",
    ["api_name"]
)

# Processing metrics
ARTICLES_PROCESSED = Counter(
    "articles_processed_total",
    "Total number of articles processed",
    ["status"] # success, duplicate, failed
)

# Queue metrics
QUEUE_SIZE = Gauge(
    "queue_size_messages",
    "Current number of messages in queues",
    ["queue_name"]
)

# Error metrics
ERRORS_TOTAL = Counter(
    "errors_total",
    "Total number of errors encountered",
    ["error_type", "service"]
)
