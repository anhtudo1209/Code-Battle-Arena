import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Middlewares
app.use(cors({ origin: "https://codebattlearena.id.vn" })); // allow frontend requests
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/practice", authMiddleware, practiceRoutes);

// Serve frontend (static build) - only after API routes
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
