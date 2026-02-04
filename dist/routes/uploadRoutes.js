"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const allowedTypes = [
    ".html",
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".doc",
    ".docx",
    ".txt",
];
const storage = multer_1.default.diskStorage({
    destination: "assets/",
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const nameWithoutExt = path_1.default.basename(file.originalname, ext);
        let uniqueName = file.originalname;
        let counter = 1;
        // Check if file exists and increment counter until we find an available name
        while (fs_1.default.existsSync(path_1.default.join("assets", uniqueName))) {
            uniqueName = `${nameWithoutExt}_${counter}${ext}`;
            counter++;
        }
        cb(null, uniqueName);
    },
});
//@ts-ignore
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
        return cb(new Error("File type not allowed"));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({ storage, fileFilter });
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.protect, upload.array("file"), (req, res) => {
    const filesArray = Array.isArray(req.files) ? req.files : [];
    if (!filesArray.length) {
        return res.status(400).json({ message: "No files uploaded" });
    }
    const uploadedFiles = filesArray.map((file) => ({
        fileName: file.filename,
        url: `${req.protocol}://${req.get("host")}/${file.filename}`,
    }));
    const primaryFile = uploadedFiles[0];
    res.json({
        message: filesArray.length > 1 ? "Files uploaded successfully" : "File uploaded successfully",
        fileName: primaryFile?.fileName,
        url: primaryFile?.url,
        files: uploadedFiles,
    });
});
router.get("/", (req, res) => {
    const assetsDir = "assets";
    if (!fs_1.default.existsSync(assetsDir)) {
        return res.json({ files: [] });
    }
    const files = fs_1.default.readdirSync(assetsDir).map((filename) => ({
        fileName: filename,
        url: `${req.protocol}://${req.get("host")}/${filename}`,
    }));
    res.json({ files });
});
// Delete a file from the assets directory (protected)
router.delete("/:filename", authMiddleware_1.protect, (req, res) => {
    const { filename } = req.params;
    if (!filename) {
        return res.status(400).json({ message: "Filename is required" });
    }
    // Prevent path traversal attacks
    const safeName = path_1.default.basename(filename);
    const filePath = path_1.default.join("assets", safeName);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
    }
    fs_1.default.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: "Failed to delete file", error: err.message });
        }
        res.json({ message: "File deleted successfully", fileName: safeName });
    });
});
exports.default = router;
//# sourceMappingURL=uploadRoutes.js.map