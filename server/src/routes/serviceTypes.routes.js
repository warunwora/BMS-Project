import { Router } from "express";
import * as c from "../controllers/serviceTypes.controller.js";

const r = Router();
r.get("/", c.list);

export default r;
