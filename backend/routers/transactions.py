import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import User, Client, Transaction
from schemas import TransactionCreate, TransactionRead, TransactionUpdate
from auth import get_current_user

router = APIRouter(tags=["transactions"])


async def get_owned_client(client_id: uuid.UUID, user: User, db: AsyncSession) -> Client:
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.user_id == user.id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


async def get_owned_transaction(
    transaction_id: uuid.UUID, user: User, db: AsyncSession
) -> Transaction:
    result = await db.execute(
        select(Transaction)
        .join(Client)
        .where(Transaction.id == transaction_id, Client.user_id == user.id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.get("/clients/{client_id}/transactions", response_model=list[TransactionRead])
async def list_transactions(
    client_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_owned_client(client_id, current_user, db)
    result = await db.execute(
        select(Transaction)
        .where(Transaction.client_id == client_id)
        .order_by(Transaction.date)
    )
    return result.scalars().all()


@router.post(
    "/clients/{client_id}/transactions",
    response_model=TransactionRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_transaction(
    client_id: uuid.UUID,
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await get_owned_client(client_id, current_user, db)
    tx = Transaction(**payload.model_dump(), client_id=client_id)
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return tx


@router.put("/transactions/{transaction_id}", response_model=TransactionRead)
async def update_transaction(
    transaction_id: uuid.UUID,
    payload: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = await get_owned_transaction(transaction_id, current_user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)
    await db.commit()
    await db.refresh(tx)
    return tx


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tx = await get_owned_transaction(transaction_id, current_user, db)
    await db.delete(tx)
    await db.commit()
