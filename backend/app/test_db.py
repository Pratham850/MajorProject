import asyncio
from sqlalchemy import text
from app.database import engine

async def check_connection():
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
        print("[SUCCESS] Database Connected Successfully!")
        print("Result:", result.scalar())
    except Exception as e:
        print("[FAILED] Connection Failed")
        print(e)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(check_connection())