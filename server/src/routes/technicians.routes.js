import { Router } from "express";
import { pool } from "../db/pool.js";
import { sendData, sendError } from "../utils/response.js";

const r = Router();

r.get("/", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const params = search ? [`%${search}%`] : [];
    const where = search ? "WHERE name ILIKE $1 OR code ILIKE $1" : "";
    const { rows } = await pool.query(`SELECT * FROM technician ${where} ORDER BY id`, params);
    sendData(res, rows);
  } catch (e) { sendError(res, e.message, 400); }
});

r.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM technician WHERE id = $1", [req.params.id]);
    if (!rows[0]) return sendError(res, "Not found", 404);
    sendData(res, rows[0]);
  } catch (e) { sendError(res, e.message, 400); }
});

export default r;
