import asyncio
from sqlalchemy import text
from app.database import engine

async def verify_users_table():
    async with engine.begin() as conn:
        print("\n--- TABLES IN DB ---")
        tables = await conn.execute(text("SHOW TABLES;"))
        for t in tables.fetchall():
            print(t)
        
        print("\n--- DESCRIBE USERS TABLE ---")
        columns = await conn.execute(text("DESCRIBE users;"))
        for c in columns.fetchall():
            print(c)
            
        print("\n--- SHOW INDEXES IN USERS TABLE ---")
        indexes = await conn.execute(text("SHOW INDEX FROM users;"))
        for idx in indexes.fetchall():
            print(idx[2], "->", idx[4], "(Unique:", idx[1] == 0, ")")
            
    await engine.dispose()

asyncio.run(verify_users_table())
