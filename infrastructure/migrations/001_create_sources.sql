-- Extension for UUID generation and Trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TYPE source_type AS ENUM ('RSS', 'API', 'WEBSITE', 'SOCIAL_MEDIA');
CREATE TYPE source_status AS ENUM ('active', 'inactive', 'failing');

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type source_type NOT NULL,
    url TEXT NOT NULL,
    rss_url TEXT,
    api_endpoint TEXT,
    country VARCHAR(100),
    language VARCHAR(50) DEFAULT 'tr',
    trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
    status source_status DEFAULT 'active',
    last_checked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Trigram index for fast fuzzy searching by source name
CREATE INDEX idx_sources_name_trgm ON sources USING gin (name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_sources_status ON sources(status) WHERE deleted_at IS NULL;
