import { Router } from "express";
import * as c from "../controllers/receipts.controller.js";

const r = Router();
r.post("/", c.create);
r.get("/:id", c.get);
r.delete("/:id", c.remove);

export default r;
