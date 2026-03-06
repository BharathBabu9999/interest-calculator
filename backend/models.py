import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Float, ForeignKey, DateTime, Date, Enum, Text, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False, server_default="")
    google_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    clients: Mapped[list["Client"]] = relationship("Client", back_populates="user", cascade="all, delete-orphan")
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="reset_tokens")


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    client_type: Mapped[str] = mapped_column(
        Enum("individual", "financial_institution", name="client_type_enum"),
        nullable=False,
        default="individual",
        server_default="individual",
    )
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="clients")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="client", cascade="all, delete-orphan")
    files: Mapped[list["ClientFile"]] = relationship("ClientFile", back_populates="client", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    interest_rate: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[str] = mapped_column(Enum("lend", "borrow", name="transaction_type"), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completed: Mapped[bool] = mapped_column(nullable=False, server_default="false")
    reminder_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    client: Mapped["Client"] = relationship("Client", back_populates="transactions")


class ClientFile(Base):
    __tablename__ = "client_files"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    mimetype: Mapped[str] = mapped_column(String(200), nullable=False)
    size: Mapped[int] = mapped_column(nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    client: Mapped["Client"] = relationship("Client", back_populates="files")
