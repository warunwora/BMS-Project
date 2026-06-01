import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

pg.types.setTypeParser(1082, (v) => v);
pg.types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));


const connectionString =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === "production"
    ? (() => { throw new Error("DATABASE_URL is required in production."); })()
    : "postgresql://root:root@localhost:15433/bms_db");

export const pool = new pg.Pool({ connectionString });

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});
