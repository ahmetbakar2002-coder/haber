CREATE TYPE article_publish_status AS ENUM ('standard', 'published', 'highlighted', 'featured', 'rejected');

-- This is the partitioned table
CREATE TABLE articles (
    id UUID DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL,
    category_id UUID,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    raw_content TEXT,
    language VARCHAR(50) DEFAULT 'tr',
    verification_score INTEGER DEFAULT 0 CHECK (verification_score >= 0 AND verification_score <= 100),
    priority_score INTEGER DEFAULT 0,
    status article_publish_status DEFAULT 'standard',
    is_breaking BOOLEAN DEFAULT FALSE,
    is_milli_haber BOOLEAN DEFAULT FALSE,
    hash VARCHAR(256) NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Partitioning key must be part of primary/unique keys if they exist
    PRIMARY KEY (id, created_at),
    
    -- Foreign keys are supported on partitioned tables in PG 12+
    FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) PARTITION BY RANGE (created_at);

-- GIN Index for Full Text Search on Content and Title
CREATE INDEX idx_articles_fts ON articles USING gin(to_tsvector('turkish', coalesce(title, '') || ' ' || coalesce(content, '')));

-- B-Tree Indexes for rapid filtering
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_status ON articles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_publish_date ON articles(published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_slug ON articles(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_articles_priority ON articles(priority_score DESC) WHERE deleted_at IS NULL;

-- Unique constraint covering partition key
CREATE UNIQUE INDEX idx_articles_hash_created ON articles(hash, created_at);

-- Create initial partitions (Example for June and July 2026)
CREATE TABLE articles_p2026_06 PARTITION OF articles FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE articles_p2026_07 PARTITION OF articles FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Archive partition (for very old data if they are imported with old timestamps)
CREATE TABLE articles_archive PARTITION OF articles DEFAULT;
