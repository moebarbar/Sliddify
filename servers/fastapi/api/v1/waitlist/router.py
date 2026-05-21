from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from models.sql.waitlist_entry import WaitlistEntry
from services.database import get_async_session

API_V1_WAITLIST_ROUTER = APIRouter(prefix="/api/v1/waitlist", tags=["Waitlist"])


class WaitlistJoinRequest(BaseModel):
    email: EmailStr
    source: Optional[str] = Field(default=None, max_length=64)


class WaitlistJoinResponse(BaseModel):
    ok: bool = True


@API_V1_WAITLIST_ROUTER.post("", response_model=WaitlistJoinResponse, status_code=201)
async def join_waitlist(
    body: WaitlistJoinRequest,
    sql_session: AsyncSession = Depends(get_async_session),
):
    entry = WaitlistEntry(email=str(body.email).lower().strip(), source=body.source)
    sql_session.add(entry)
    try:
        await sql_session.commit()
    except IntegrityError:
        # Already on the list — treat as success so the UI feels nice.
        await sql_session.rollback()
    return WaitlistJoinResponse(ok=True)
