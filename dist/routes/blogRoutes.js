"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sectionController_1 = require("../controllers/sectionController");
const router = express_1.default.Router();
router.get("/", sectionController_1.getBlogs); // List all blogs
router.get("/:index", sectionController_1.getBlogDetail); // Single blog detail by index
exports.default = router;
//# sourceMappingURL=blogRoutes.js.map