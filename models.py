from sqlalchemy import (
    Boolean,
    Column,
    Date,
    Float,
    Integer,
    String,
    CheckConstraint,
)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Store(Base):
    """Outlet/Store entity representing a physical sales point."""

    __tablename__ = "stores"
    __table_args__ = (
        CheckConstraint("priority_tier IN (1, 2, 3)", name="ck_stores_priority_tier"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    channel = Column(String(100), nullable=False)  # e.g. supermarket, convenience, pharmacy
    territory = Column(String(100), nullable=False)
    priority_tier = Column(Integer, nullable=False)  # 1=high, 2=medium, 3=low
    last_visited_date = Column(Date, nullable=True)
    active = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return (
            f"<Store id={self.id} name={self.name!r} channel={self.channel!r} "
            f"territory={self.territory!r} priority_tier={self.priority_tier} active={self.active}>"
        )
