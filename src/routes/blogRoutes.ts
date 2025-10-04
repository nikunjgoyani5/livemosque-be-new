import express from "express";
import { getBlogs, getBlogDetail } from "../controllers/sectionController";

const router = express.Router();

router.get("/", getBlogs); // List all blogs
router.get("/:index", getBlogDetail); // Single blog detail by index

export default router;
