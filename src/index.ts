import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import sectionRoutes from "./routes/sectionRoutes";
import fileRoutes from "./routes/fileRoutes";
import blogRoutes from "./routes/blogRoutes";
import path from "path";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();
// Allow CORS with JSON body
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// also serve static uploads so you can view them
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) =>
  res.send("server is running on http://localhost:" + PORT)
);

app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/blogs", blogRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
