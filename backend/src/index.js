import "dotenv/config";
import express from "express";
import cors from "cors";
import { supabase } from "./lib/supabase.js";
import members from "./routes/members.js";
import courts from "./routes/courts.js";
import coaches from "./routes/coaches.js";
import technicians from "./routes/technicians.js";
import assets from "./routes/assets.js";
import products from "./routes/products.js";
import bookings from "./routes/bookings.js";
import rentals from "./routes/rentals.js";
import sessions from "./routes/sessions.js";
import workOrders from "./routes/workOrders.js";
import receipts from "./routes/receipts.js";
import sales from "./routes/sales.js";
import serviceTypes from "./routes/serviceTypes.js";

const app = express();
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const { data, error } = await supabase.from("court").select("count", { count: "exact" });
    if (error) throw error;
    res.json({
      status: "connected",
      supabaseUrl: process.env.SUPABASE_URL,
      courtsCount: data?.length || 0
    });
  } catch (e) {
    res.status(400).json({ status: "disconnected", error: e.message });
  }
});

app.use("/api/members", members);
app.use("/api/courts", courts);
app.use("/api/coaches", coaches);
app.use("/api/technicians", technicians);
app.use("/api/assets", assets);
app.use("/api/products", products);
app.use("/api/bookings", bookings);
app.use("/api/rentals", rentals);
app.use("/api/sessions", sessions);
app.use("/api/work-orders", workOrders);
app.use("/api/receipts", receipts);
app.use("/api/sales", sales);
app.use("/api/service-types", serviceTypes);


app.listen(process.env.PORT || 4000, () => {
  console.log(`Backend running on port ${process.env.PORT || 4000}`);
  console.log(`Supabase connected to: ${process.env.SUPABASE_URL}`);
});
