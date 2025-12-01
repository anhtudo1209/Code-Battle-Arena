import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import adminMiddleware from "./middleware/adminMiddleware.js";

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (override any existing env vars)
// From backend/src, we need to go up 2 levels to reach project root
dotenv.config({ path: path.resolve(__dirname, '../..', '.env'), override: true });
const app = express();

// Middlewares
app.use(cors({ 
  origin: ["https://localhost:5173", "http://localhost:5173", "https://localhost:3000", "http://localhost:3000"],
  credentials: true
})); // allow frontend requests
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/practice", authMiddleware, practiceRoutes);
app.use("/api/admin", adminMiddleware, adminRoutes);

// Serve frontend (static build) - only after API routes
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

// Start server
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`🚀 Server running ${PORT}`);
});