import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware";

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

const storage = multer.diskStorage({
  destination: "assets/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    let uniqueName = file.originalname;
    let counter = 1;

    // Check if file exists and increment counter until we find an available name
    while (fs.existsSync(path.join("assets", uniqueName))) {
      uniqueName = `${nameWithoutExt}_${counter}${ext}`;
      counter++;
    }

    cb(null, uniqueName);
  },
});

//@ts-ignore
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return cb(new Error("File type not allowed"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

const router = Router();

router.post("/", protect, upload.single("file"), (req: any, res) => {
  res.json({
    message: "File uploaded successfully",
    fileName: req.file.filename,
    url: `${req.protocol}://${req.get("host")}/${req.file.filename}`,
  });
});

router.get("/", (req, res) => {
  const assetsDir = "assets";

  if (!fs.existsSync(assetsDir)) {
    return res.json({ files: [] });
  }

  const files = fs.readdirSync(assetsDir).map((filename) => ({
    fileName: filename,
    url: `${req.protocol}://${req.get("host")}/${filename}`,
  }));

  res.json({ files });
});

// Delete a file from the assets directory (protected)
router.delete("/:filename", protect, (req, res) => {
  const { filename } = req.params;

  if (!filename) {
    return res.status(400).json({ message: "Filename is required" });
  }

  // Prevent path traversal attacks
  const safeName = path.basename(filename);
  const filePath = path.join("assets", safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to delete file", error: err.message });
    }

    res.json({ message: "File deleted successfully", fileName: safeName });
  });
});

export default router;
