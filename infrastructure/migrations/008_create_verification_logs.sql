CREATE TABLE verification_logs (
    id UUID DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    article_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    verification_score INTEGER NOT NULL CHECK (verification_score >= 0 AND verification_score <= 100),
    verification_result VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, created_at),
    FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
) PARTITION BY RANGE (created_at);

-- Indexes
CREATE INDEX idx_verification_logs_article_id ON verification_logs(article_id);
-- GIN index for fast search inside the details JSON payload
CREATE INDEX idx_verification_logs_details ON verification_logs USING gin (details);

-- Initial Partitions
CREATE TABLE verification_logs_p2026_06 PARTITION OF verification_logs FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE verification_logs_p2026_07 PARTITION OF verification_logs FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE verification_logs_archive PARTITION OF verification_logs DEFAULT;
