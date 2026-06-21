CREATE TABLE article_tags (
    article_id UUID NOT NULL,
    article_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    
    PRIMARY KEY (article_id, article_created_at, tag_id),
    FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);
