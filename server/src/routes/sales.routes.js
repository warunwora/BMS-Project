import { Router } from "express";
import * as c from "../controllers/sales.controller.js";

const r = Router();
r.get("/points", c.points);
r.get("/", c.list);

export default r;
