import uuid
from datetime import date as Date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, field_validator

ClientType = Literal["individual", "financial_institution"]


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


# ── Clients ───────────────────────────────────────────────────────────────────

class ClientCreate(BaseModel):
    name: str
    client_type: ClientType = "individual"
    currency: str = "USD"
    notes: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    client_type: Optional[ClientType] = None
    currency: Optional[str] = None
    notes: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None


class ClientRead(BaseModel):
    id: uuid.UUID
    name: str
    client_type: ClientType
    currency: str
    notes: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    company: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Transactions ──────────────────────────────────────────────────────────────

class TransactionCreate(BaseModel):
    date: Date
    amount: float
    interest_rate: float
    type: Literal["lend", "borrow"]
    notes: Optional[str] = None
    completed: bool = False
    expected_repayment_date: Optional[Date] = None

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v

    @field_validator("interest_rate")
    @classmethod
    def rate_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Interest rate must be non-negative")
        return v


class TransactionUpdate(BaseModel):
    date: Optional[Date] = None
    amount: Optional[float] = None
    interest_rate: Optional[float] = None
    type: Optional[Literal["lend", "borrow"]] = None
    notes: Optional[str] = None
    completed: Optional[bool] = None
    expected_repayment_date: Optional[Date] = None


class TransactionRead(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    date: Date
    amount: float
    interest_rate: float
    type: str
    notes: Optional[str]
    completed: bool
    expected_repayment_date: Optional[Date] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Client Files ──────────────────────────────────────────────────────────────

class ClientFileRead(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    original_filename: str
    mimetype: str
    size: int
    description: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
