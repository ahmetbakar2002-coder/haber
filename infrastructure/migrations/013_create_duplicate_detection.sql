CREATE TABLE duplicate_detection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL,
    article_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    similar_article_id UUID NOT NULL,
    similar_article_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    similarity_score NUMERIC(5,2) NOT NULL CHECK (similarity_score >= 0.0 AND similarity_score <= 100.0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE,
    FOREIGN KEY (similar_article_id, similar_article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

CREATE INDEX idx_duplicate_detection_article_id ON duplicate_detection(article_id);
CREATE INDEX idx_duplicate_detection_similar_article_id ON duplicate_detection(similar_article_id);
