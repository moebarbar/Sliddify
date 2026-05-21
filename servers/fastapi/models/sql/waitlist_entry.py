from datetime import datetime
from typing import Optional
import uuid

from sqlalchemy import Column, DateTime, String
from sqlmodel import Field, SQLModel

from utils.datetime_utils import get_current_utc_datetime


class WaitlistEntry(SQLModel, table=True):
    __tablename__ = "waitlist_entries"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(
        sa_column=Column(String(320), nullable=False, unique=True, index=True)
    )
    source: Optional[str] = Field(default=None, max_length=64)
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            default=get_current_utc_datetime,
        )
    )
