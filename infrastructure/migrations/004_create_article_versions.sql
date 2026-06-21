CREATE TABLE article_versions (
    id UUID DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    article_created_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Needed for Foreign Key to partitioned table
    version_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, created_at),
    FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
) PARTITION BY RANGE (created_at);

-- Indexes
CREATE INDEX idx_article_versions_article_id ON article_versions(article_id);

-- Initial Partitions
CREATE TABLE article_versions_p2026_06 PARTITION OF article_versions FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE article_versions_p2026_07 PARTITION OF article_versions FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE article_versions_archive PARTITION OF article_versions DEFAULT;
