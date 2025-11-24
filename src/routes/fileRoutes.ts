import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import cloudinary from "cloudinary";
import sharp from "sharp";

const router = express.Router();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME! || "dtcbpwl2d",
  api_key: process.env.CLOUDINARY_API_KEY! || "319752223439493",
  api_secret:
    process.env.CLOUDINARY_API_SECRET! || "EtXHNs6pk6BfVT9ctFvPfpDVaYE",
});

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

function extractPublicId(url: string): string {
  try {
    const parts = url.split("/upload/")[1]; // take everything after /upload/
    if (!parts) return "";

    // Remove leading version number v123...
    const withoutVersion = parts.replace(/^v\d+\//, "");

    // Remove file extension
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return "";
  }
}

async function compressImage(
  file: Express.Multer.File
): Promise<Buffer | Express.Multer.File> {
  const MAX_SIZE_MB = 10;
  const bytesToMB = file.size / (1024 * 1024);

  // If file <= 10 MB → do NOT compress
  if (bytesToMB <= MAX_SIZE_MB) {
    return file;
  }

  console.log("Original file size:", bytesToMB, "MB", file);

  try {
    // Compress the image using sharp
    const compressedBuffer = await sharp(file.buffer)
      .resize({
        width: 1920, // Resize to a maximum width of 1920px
        withoutEnlargement: true, // Do not enlarge smaller images
      })
      .jpeg({ quality: 80 }) // Adjust quality to 80%
      .toBuffer();

    console.log(
      "Compressed file size:",
      compressedBuffer.length / (1024 * 1024),
      "MB"
    );

    return compressedBuffer;
  } catch (error) {
    console.error("Image compression error:", error);
    return file; // Fallback to original file if compression fails
  }
}

router.post(
  "/manage",
  upload.array("files", 10),
  async (req: Request, res: Response) => {
    try {
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

      const uploaded: string[] = [];
      const deleted: string[] = [];

      // 1️⃣ Upload new files to Cloudinary
      if (files && files.length > 0) {
        for (const file of files) {
          const fileType = file.mimetype;

          if (fileType.startsWith("image/")) {
            // Compress image if larger than 10 MB
            const compressedBuffer = await compressImage(file);

            // Upload to Cloudinary
            const uploadResult = await new Promise<any>((resolve, reject) => {
              const stream = cloudinary.v2.uploader.upload_stream(
                { resource_type: "auto", folder: "uploads" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              stream.end(compressedBuffer);
            });

            uploaded.push(uploadResult.secure_url);
          } else if (fileType.startsWith("video/")) {
            // Upload video directly to Cloudinary
            const uploadResult = await new Promise<any>((resolve, reject) => {
              const stream = cloudinary.v2.uploader.upload_stream(
                { resource_type: "auto", folder: "uploads" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              );
              stream.end(file.buffer);
            });

            uploaded.push(uploadResult.secure_url);
          } else {
            // Skip saving non-image/video files
            console.warn(
              "Unsupported file type for Cloudinary upload:",
              fileType
            );
          }
        }
      }

      // 2️⃣ Delete files from Cloudinary or local server
      if (deletePaths.length > 0) {
        for (const deletePath of deletePaths) {
          if (deletePath.startsWith("https")) {
            // Cloudinary file
            const publicId = extractPublicId(deletePath);
            if (!publicId) continue;

            const result = await cloudinary.v2.uploader.destroy(publicId);
            if (result.result === "ok") deleted.push(deletePath);
          } else if (deletePath.startsWith("/uploads")) {
            // Local server file
            const fullPath = path.join(__dirname, "../../", deletePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              deleted.push(deletePath);
            }
          }
        }
      }

      res.json({ uploaded, deleted });
    } catch (error) {
      console.error("Manage API error:", error);
      res.status(500).json({ error: "Manage API failed" });
    }
  }
);

export default router;
