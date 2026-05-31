import pg from "pg";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

export const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "badminton",
});

pool.on("error", (err) => {
  logger.error("Database pool error", { message: err.message });
});
