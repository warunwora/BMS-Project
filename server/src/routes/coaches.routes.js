import { Router } from "express";
import * as c from "../controllers/coaches.controller.js";

const r = Router();
r.get("/", c.list);
r.post("/", c.create);
r.get(
  "/coach-performance-analysis",
  c.coachPerformanceAnalysis
);
r.get("/:id", c.get);
r.put("/:id", c.update);
r.delete("/:id", c.remove);

export default r;
