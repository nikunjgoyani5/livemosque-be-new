import { Router } from "express";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/sectionController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getSections);
router.post("/", protect, createSection);
router.patch("/:id", protect, updateSection);
router.delete("/:id", protect, deleteSection);

export default router;
