import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// uploads folder (create if not exists)
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // sanitize original name
    const original = file.originalname
      .trim()
      .replace(/\s+/g, "_") // spaces to underscores
      .replace(/[^\w.\-]/g, ""); // remove weird chars except dot and dash

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${original}`);
  },
});

const upload = multer({ storage });

router.post(
  "/manage",
  upload.array("files", 10),
  (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;

    // handle deletePaths[] or deletePaths
    const deletePathsRaw =
      (req.body.deletePaths as string | string[]) ||
      (req.body["deletePaths[]"] as string | string[]);

    let deletePaths: string[] = [];
    if (deletePathsRaw) {
      deletePaths = Array.isArray(deletePathsRaw)
        ? deletePathsRaw
        : [deletePathsRaw];
    }

    // build uploaded files response
    const uploadedFiles: string[] = [];
    if (files && files.length > 0) {
      for (const f of files) {
        uploadedFiles.push(`/uploads/${f.filename}`);
      }
    }

    // delete files
    const deletedFiles: string[] = [];
    if (deletePaths.length > 0) {
      for (const relPath of deletePaths) {
        const fullPath = path.join(__dirname, "../../", relPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          deletedFiles.push(relPath);
        }
      }
    }

    res.json({ uploaded: uploadedFiles, deleted: deletedFiles });
  }
);

export default router;
