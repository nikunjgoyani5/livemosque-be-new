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

export default router;
