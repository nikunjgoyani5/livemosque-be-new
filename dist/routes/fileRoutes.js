"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const sharp_1 = __importDefault(require("sharp"));
const router = express_1.default.Router();
// Cloudinary configuration
cloudinary_1.default.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dtcbpwl2d",
    api_key: process.env.CLOUDINARY_API_KEY || "319752223439493",
    api_secret: process.env.CLOUDINARY_API_SECRET || "EtXHNs6pk6BfVT9ctFvPfpDVaYE",
});
const memoryStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: memoryStorage });
function extractPublicId(url) {
    try {
        const parts = url.split("/upload/")[1]; // take everything after /upload/
        if (!parts)
            return "";
        // Remove leading version number v123...
        const withoutVersion = parts.replace(/^v\d+\//, "");
        // Remove file extension
        return withoutVersion.replace(/\.[^/.]+$/, "");
    }
    catch {
        return "";
    }
}
async function compressImage(file) {
    const MAX_SIZE_MB = 10;
    const bytesToMB = file.size / (1024 * 1024);
    // If file <= 10 MB → do NOT compress
    if (bytesToMB <= MAX_SIZE_MB) {
        return file.buffer; // Return the original buffer
    }
    console.log("Original file size:", bytesToMB, "MB", file);
    try {
        // Compress the image using sharp
        const compressedBuffer = await (0, sharp_1.default)(file.buffer)
            .resize({
            width: 1920, // Resize to a maximum width of 1920px
            withoutEnlargement: true, // Do not enlarge smaller images
        })
            .jpeg({ quality: 80 }) // Adjust quality to 80%
            .toBuffer();
        console.log("Compressed file size:", compressedBuffer.length / (1024 * 1024), "MB");
        return compressedBuffer; // Return the compressed buffer
    }
    catch (error) {
        console.error("Image compression error:", error);
        return file.buffer; // Fallback to original buffer if compression fails
    }
}
router.post("/manage", upload.array("files", 10), async (req, res) => {
    try {
        const files = req.files;
        // handle deletePaths[] or deletePaths
        const deletePathsRaw = req.body.deletePaths ||
            req.body["deletePaths[]"];
        let deletePaths = [];
        if (deletePathsRaw) {
            deletePaths = Array.isArray(deletePathsRaw)
                ? deletePathsRaw
                : [deletePathsRaw];
        }
        const uploaded = [];
        const deleted = [];
        // 1️⃣ Upload new files to Cloudinary
        if (files && files.length > 0) {
            for (const file of files) {
                const fileType = file.mimetype;
                if (fileType.startsWith("image/")) {
                    // Compress image if larger than 10 MB
                    const compressedBuffer = await compressImage(file);
                    // Upload to Cloudinary
                    const uploadResult = await new Promise((resolve, reject) => {
                        const stream = cloudinary_1.default.v2.uploader.upload_stream({ resource_type: "auto", folder: "uploads" }, (error, result) => {
                            if (error)
                                reject(error);
                            else
                                resolve(result);
                        });
                        stream.end(compressedBuffer); // Ensure this is a Buffer
                    });
                    uploaded.push(uploadResult.secure_url);
                }
                else if (fileType.startsWith("video/")) {
                    // Upload video directly to Cloudinary
                    const uploadResult = await new Promise((resolve, reject) => {
                        const stream = cloudinary_1.default.v2.uploader.upload_stream({ resource_type: "auto", folder: "uploads" }, (error, result) => {
                            if (error)
                                reject(error);
                            else
                                resolve(result);
                        });
                        stream.end(file.buffer); // Ensure this is a Buffer
                    });
                    uploaded.push(uploadResult.secure_url);
                }
                else {
                    // Skip saving non-image/video files
                    console.warn("Unsupported file type for Cloudinary upload:", fileType);
                }
            }
        }
        // 2️⃣ Delete files from Cloudinary or local server
        if (deletePaths.length > 0) {
            for (const deletePath of deletePaths) {
                if (deletePath.startsWith("https")) {
                    // Cloudinary file
                    const publicId = extractPublicId(deletePath);
                    if (!publicId)
                        continue;
                    const result = await cloudinary_1.default.v2.uploader.destroy(publicId);
                    if (result.result === "ok")
                        deleted.push(deletePath);
                }
                else if (deletePath.startsWith("/uploads")) {
                    // Local server file
                    const fullPath = path_1.default.join(__dirname, "../../", deletePath);
                    if (fs_1.default.existsSync(fullPath)) {
                        fs_1.default.unlinkSync(fullPath);
                        deleted.push(deletePath);
                    }
                }
            }
        }
        res.json({ uploaded, deleted });
    }
    catch (error) {
        console.error("Manage API error:", error);
        res.status(500).json({ error: "Manage API failed" });
    }
});
exports.default = router;
//# sourceMappingURL=fileRoutes.js.map