-- ÇAKÜ Spor AI Newsroom V7.0 Database Schema

-- Enums
CREATE TYPE publish_status AS ENUM ('standard', 'published', 'highlighted', 'featured', 'rejected');

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sources Table
CREATE TABLE sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'RSS', 'API', 'SCRAPER', 'SOCIAL'
    url TEXT NOT NULL,
    reliability_score INTEGER DEFAULT 50, -- 1-100
    is_active BOOLEAN DEFAULT TRUE,
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Articles Table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id INTEGER REFERENCES sources(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    original_title TEXT NOT NULL,
    original_url TEXT UNIQUE NOT NULL,
    original_content TEXT,
    title VARCHAR(255),
    slug VARCHAR(120) UNIQUE,
    meta_title VARCHAR(100),
    meta_description VARCHAR(255),
    canonical_url TEXT,
    summary TEXT,
    content TEXT,
    author VARCHAR(100) DEFAULT 'ÇAKÜ Spor AI',
    priority INTEGER DEFAULT 0,
    status publish_status DEFAULT 'standard',
    label VARCHAR(50),
    publish_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article Versions Table (for history and SEO updates)
CREATE TABLE article_versions (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    summary TEXT,
    title VARCHAR(255),
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Article Images Table
CREATE TABLE article_images (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text VARCHAR(255),
    title VARCHAR(255),
    caption TEXT,
    source TEXT,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL
);

-- Article Tags Junction
CREATE TABLE article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    is_seo_keyword BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (article_id, tag_id)
);

-- Verification Logs
CREATE TABLE verification_logs (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Social Posts Table
CREATE TABLE social_posts (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'Twitter', 'Facebook', 'OpenGraph'
    title VARCHAR(255),
    description TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Logs
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL, -- 'INFO', 'WARN', 'ERROR', 'FATAL'
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Logs
CREATE TABLE api_logs (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_priority ON articles(priority DESC);
CREATE INDEX idx_articles_publish_date ON articles(publish_date DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_system_logs_service ON system_logs(service_name);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
