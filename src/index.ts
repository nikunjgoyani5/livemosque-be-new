import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import sectionRoutes from "./routes/sectionRoutes";
import fileRoutes from "./routes/fileRoutes";
import blogRoutes from "./routes/blogRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import path from "path";

dotenv.config();
connectDB();

const PORT = process.env.PORT || 5000;
const app = express();
// Allow CORS with JSON body
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://livemosque-beta.vercel.app",
      "https://app.livemosque.live",
      "https://livemosque.live",
      "https://live-mosuqe-website.vercel.app",
      ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
    ],
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// also serve static uploads so you can view them
app.use("/", express.static(path.join(__dirname, "../assets")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) =>
  res.send("server is running on http://localhost:" + PORT)
);

app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/blogs", blogRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
