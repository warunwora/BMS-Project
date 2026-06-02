import { Router } from "express";
import * as c from "../controllers/rentals.controller.js";

const r = Router();
r.get("/", c.list);
r.get("/damage-analysis", c.damageAnalysis);
r.post("/", c.create);
r.get("/:id", c.get);
r.put("/:id", c.update);
r.delete("/:id", c.remove);

export default r;
