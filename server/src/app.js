import express from "express";
import cors from "cors";
import logger from "./utils/logger.js";

import membersRoutes from "./routes/members.routes.js";
import courtsRoutes from "./routes/courts.routes.js";
import coachesRoutes from "./routes/coaches.routes.js";
import assetsRoutes from "./routes/assets.routes.js";
import productsRoutes from "./routes/products.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import rentalsRoutes from "./routes/rentals.routes.js";
import sessionsRoutes from "./routes/sessions.routes.js";
import workOrdersRoutes from "./routes/workOrders.routes.js";
import receiptsRoutes from "./routes/receipts.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import techniciansRoutes from "./routes/technicians.routes.js";

const app = express();

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info(`[${req.method}] ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin === undefined || corsOrigin === "" ? true : corsOrigin.split(",").map((o) => o.trim()),
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/api/members", membersRoutes);
app.use("/api/courts", courtsRoutes);
app.use("/api/coaches", coachesRoutes);
app.use("/api/assets", assetsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/rentals", rentalsRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/work-orders", workOrdersRoutes);
app.use("/api/receipts", receiptsRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/technicians", techniciansRoutes);

const port = process.env.PORT || 4000;
const host = process.env.HOST || "0.0.0.0";
app.listen(port, host, () => logger.info(`BMS server listening on ${host}:${port}`));
