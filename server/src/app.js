import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import assetsRoutes from "./routes/assets.routes.js";
import assetrentsRoutes from "./routes/assetrents.routes.js"
import reportsRoutes from "./routes/assetreports.routes.js"

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/assets", assetsRoutes);
app.use("/api/assetrents", assetrentsRoutes);
app.use("/api/reports", reportsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => logger.info(`Server running on port ${port}`));