CREATE TABLE news_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    article_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    update_type VARCHAR(100) NOT NULL, -- e.g., 'live_score', 'injury_update', 'official_statement'
    update_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

CREATE INDEX idx_news_updates_article_id ON news_updates(article_id);
