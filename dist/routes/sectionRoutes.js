"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sectionController_1 = require("../controllers/sectionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", sectionController_1.getSections);
router.get("/:id", sectionController_1.getSectionsById);
router.post("/", authMiddleware_1.protect, sectionController_1.createSection);
router.patch("/:id", sectionController_1.updateSection);
router.delete("/:id", authMiddleware_1.protect, sectionController_1.deleteSection);
exports.default = router;
//# sourceMappingURL=sectionRoutes.js.map