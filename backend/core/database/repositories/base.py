from typing import TypeVar, Generic, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete

T = TypeVar("T")

class BaseRepository(Generic[T]):
    def __init__(self, model_class: Type[T], session: AsyncSession):
        self.model_class = model_class
        self.session = session

    async def get_by_id(self, id: str) -> Optional[T]:
        result = await self.session.execute(
            select(self.model_class).where(self.model_class.id == id)
        )
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        result = await self.session.execute(
            select(self.model_class).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def create(self, obj_in: dict) -> T:
        obj = self.model_class(**obj_in)
        self.session.add(obj)
        await self.session.commit()
        await self.session.refresh(obj)
        return obj

    async def update(self, id: str, obj_in: dict) -> Optional[T]:
        await self.session.execute(
            update(self.model_class)
            .where(self.model_class.id == id)
            .values(**obj_in)
        )
        await self.session.commit()
        return await self.get_by_id(id)

    async def delete(self, id: str) -> bool:
        """Soft delete assuming a deleted_at column exists. Override if hard delete is needed."""
        from sqlalchemy.sql import func
        result = await self.session.execute(
            update(self.model_class)
            .where(self.model_class.id == id)
            .values(deleted_at=func.now())
        )
        await self.session.commit()
        return result.rowcount > 0
