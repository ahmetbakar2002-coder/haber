CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigram index for fuzzy searching on tag names (very useful for tag suggestions)
CREATE INDEX idx_tags_name_trgm ON tags USING gin (name gin_trgm_ops);
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC);
