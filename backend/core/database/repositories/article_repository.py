from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from core.database.repositories.base import BaseRepository
from core.database.models.article import Article

class ArticleRepository(BaseRepository[Article]):
    def __init__(self, session: AsyncSession):
        super().__init__(Article, session)

    async def get_by_hash(self, article_hash: str) -> Optional[Article]:
        result = await self.session.execute(
            select(Article).where(Article.hash == article_hash)
        )
        return result.scalars().first()
