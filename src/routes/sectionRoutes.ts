import { Router } from "express";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
  getSectionsById,
} from "../controllers/sectionController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getSections);
router.get("/:id", getSectionsById);
router.post("/", protect, createSection);
router.patch("/:id", updateSection);
router.delete("/:id", protect, deleteSection);

export default router;
