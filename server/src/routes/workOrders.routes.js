import { Router } from "express";
import * as c from "../controllers/workOrders.controller.js";

const r = Router();

r.get("/", c.list);

r.get(
  "/service-type-analysis",
  c.serviceTypeAnalysis
);

r.post("/", c.create);

r.get("/:id", c.get);

r.put("/:id", c.update);

r.delete("/:id", c.remove);

export default r;