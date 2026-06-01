import { Router } from "express";
import * as c from "../controllers/rentals.controller.js";

const r = Router();
r.get("/", c.list);
r.post("/", c.create);
r.get("/:id", c.get);
r.put("/:id", c.update);
r.delete("/:id", c.remove);

export default r;
