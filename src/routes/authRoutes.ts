import { Router } from "express";
import {
  loginAdmin,
  changePassword,
  changeEmail,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", loginAdmin);
router.post("/change-password", protect, changePassword);
router.post("/change-email", protect, changeEmail);

export default router;
