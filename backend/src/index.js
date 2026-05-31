import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { supabase } from "./lib/supabase.js";
import members from "./routes/members.js";
import courts from "./routes/courts.js";
import coaches from "./routes/coaches.js";
import assets from "./routes/assets.js";
import products from "./routes/products.js";
import bookings from "./routes/bookings.js";
import rentals from "./routes/rentals.js";
import sessions from "./routes/sessions.js";
import workOrders from "./routes/workOrders.js";
import receipts from "./routes/receipts.js";
import sales from "./routes/sales.js";

const { Client } = pg;
const __dir = dirname(fileURLToPath(import.meta.url));

const app = express();
const allowedOrigins = ["http:
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const { data, error } = await supabase.from("court").select("count", { count: "exact" });
    if (error) throw error;
    res.json({
      status: "connected",
      supabaseUrl: process.env.SUPABASE_URL,
      courtsCount: data?.length || 0
    });
  } catch (e) {
    res.status(400).json({ status: "disconnected", error: e.message });
  }
});

app.use("/api/members", members);
app.use("/api/courts", courts);
app.use("/api/coaches", coaches);
app.use("/api/assets", assets);
app.use("/api/products", products);
app.use("/api/bookings", bookings);
app.use("/api/rentals", rentals);
app.use("/api/sessions", sessions);
app.use("/api/work-orders", workOrders);
app.use("/api/receipts", receipts);
app.use("/api/sales", sales);

app.post("/api/migrate", async (req, res) => {
  const pass = process.env.SUPABASE_DB_PASSWORD;
  if (!pass) return res.status(400).json({ error: "Set SUPABASE_DB_PASSWORD in backend/.env first" });

  const ref = (process.env.SUPABASE_URL || "").replace("https:
  const connStr = `postgresql:

  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  const results = [];

  try {
    await client.connect();
    const sql = readFileSync(join(__dir, "../migration.sql"), "utf8");
    const stmts = sql.split(";").map((s) => s.trim()).filter((s) => s && !s.startsWith("--"));

    for (const stmt of stmts) {
      try { await client.query(stmt); results.push({ ok: stmt.slice(0, 60) }); }
      catch (e) { results.push({ warn: e.message.split("\n")[0] }); }
    }

    res.json({ status: "done", results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await client.end().catch(() => {});
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Backend running on port ${process.env.PORT || 4000}`);
  console.log(`Supabase connected to: ${process.env.SUPABASE_URL}`);
});
