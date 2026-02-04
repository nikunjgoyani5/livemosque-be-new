"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const sectionRoutes_1 = __importDefault(require("./routes/sectionRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
(0, db_1.connectDB)();
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
// Allow CORS with JSON body
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://livemosque-beta.vercel.app",
        "https://app.livemosque.live",
        "https://livemosque.live",
        "https://live-mosuqe-website.vercel.app",
        ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
// also serve static uploads so you can view them
app.use("/", express_1.default.static(path_1.default.join(__dirname, "../assets")));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.get("/api/health", (req, res) => res.send("server is running on http://localhost:" + PORT));
app.use("/api/upload", uploadRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/sections", sectionRoutes_1.default);
app.use("/api/files", fileRoutes_1.default);
app.use("/api/blogs", blogRoutes_1.default);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map