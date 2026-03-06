"""
One-time migration: rename expected_repayment_date → reminder_date
Run once against the live database, then delete this file.

Usage (with venv activated):
    python migrate_rename_reminder_date.py
"""

import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]


async def main() -> None:
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        # Rename the column — safe to run multiple times (will error if already renamed)
        await conn.execute(
            text(
                "ALTER TABLE transactions "
                "RENAME COLUMN expected_repayment_date TO reminder_date;"
            )
        )
        print("✅  Column renamed: expected_repayment_date → reminder_date")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
