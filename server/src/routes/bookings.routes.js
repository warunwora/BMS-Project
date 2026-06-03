import { Router } from "express";
import * as c from "../controllers/bookings.controller.js";


const r = Router();
r.get("/", c.list);
r.post("/", c.create);
r.get("/", c.list);

r.get(
  "/member-tier-analysis",
  c.memberTierAnalysis
);

r.get("/:id", c.get);
r.put("/:id", c.update);
r.delete("/:id", c.remove);

export default r;
