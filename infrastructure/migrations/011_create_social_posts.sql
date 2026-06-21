CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL, -- e.g., 'X', 'YouTube', 'Instagram'
    author VARCHAR(255) NOT NULL,
    post_url TEXT NOT NULL,
    content TEXT,
    engagement_score INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_engagement ON social_posts(engagement_score DESC);
