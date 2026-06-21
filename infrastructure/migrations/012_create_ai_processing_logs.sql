CREATE TABLE ai_processing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    article_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    processing_time INTEGER, -- in milliseconds
    status VARCHAR(50) NOT NULL, -- e.g., 'success', 'failed', 'timeout'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

CREATE INDEX idx_ai_processing_logs_article_id ON ai_processing_logs(article_id);
