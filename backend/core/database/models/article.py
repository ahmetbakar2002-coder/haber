from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from core.database.base import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    source_id = Column(UUID(as_uuid=True), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    raw_content = Column(Text, nullable=True)
    language = Column(String(50), default="tr")
    verification_score = Column(Integer, default=0)
    priority_score = Column(Integer, default=0)
    status = Column(String(50), default="standard")
    is_breaking = Column(Boolean, default=False)
    is_milli_haber = Column(Boolean, default=False)
    hash = Column(String(256), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True) # Part of PK because of partitioning
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # We omit explicitly defining the partitioned indexes here as they are managed via raw SQL / Alembic.
    # But basic structure is mapped to allow ORM queries.
