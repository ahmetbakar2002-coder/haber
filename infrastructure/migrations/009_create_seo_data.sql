CREATE TABLE seo_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL UNIQUE, -- One-to-one relationship
    article_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    meta_title VARCHAR(100) NOT NULL,
    meta_description VARCHAR(255) NOT NULL,
    canonical_url TEXT NOT NULL,
    og_title VARCHAR(100),
    og_description VARCHAR(255),
    twitter_title VARCHAR(100),
    twitter_description VARCHAR(255),
    focus_keyword VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);
