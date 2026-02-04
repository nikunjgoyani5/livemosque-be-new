"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    // Check token from Authorization header or cookies
    let token = req.headers.authorization?.split(" ")[1];
    // Parse token from cookie string if not in Authorization header
    if (!token && req.headers?.cookie) {
        const cookies = req.headers.cookie.split("; ");
        const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
        if (tokenCookie) {
            token = tokenCookie.split("=")[1];
        }
    }
    if (!token)
        return res.status(401).json({ message: "Not authorized" });
    console.log("token", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.adminId = decoded.id;
        next();
    }
    catch {
        res.status(401).json({ message: "Token invalid" });
    }
};
exports.protect = protect;
//# sourceMappingURL=authMiddleware.js.map