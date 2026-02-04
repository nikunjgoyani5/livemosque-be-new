"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeEmail = exports.changePassword = exports.loginAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = require("../models/Admin");
const messages_1 = require("../helper/messages");
const loginAdmin = async (req, res) => {
    const { email = "", password = "" } = req?.body || {};
    if (!email || !password) {
        return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
            code: messages_1.MESSAGES.FIELDS_REQUIRED,
            message: "email and password is required",
        });
    }
    try {
        const admin = await Admin_1.Admin.findOne({ email });
        if (!admin)
            return res
                .status(messages_1.STATUS.FIELDS_REQUIRED)
                .json({ code: messages_1.MESSAGES.EMAIL_NOT_FOUND, message: "email not found" });
        const match = await bcrypt_1.default.compare(password, admin.passwordHash);
        if (!match)
            return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
                code: messages_1.MESSAGES.PASSWORD_MISMATCH,
                message: "please enter valid credentials",
            });
        const token = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        res
            .status(messages_1.STATUS.OK)
            .json({ code: messages_1.STATUS.OK, message: messages_1.MESSAGES.LOGIN_SUCCESS, token });
    }
    catch (error) {
        res.status(messages_1.STATUS.INTERNAL_SERVER).json({
            code: messages_1.MESSAGES.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
        });
    }
};
exports.loginAdmin = loginAdmin;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
            code: messages_1.MESSAGES.FIELDS_REQUIRED,
            message: "currentPassword and newPassword are required",
        });
    }
    if (newPassword.length < 6) {
        return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
            code: messages_1.MESSAGES.FIELDS_REQUIRED,
            message: "newPassword must be at least 6 characters",
        });
    }
    try {
        const admin = await Admin_1.Admin.findById(req.adminId);
        if (!admin) {
            return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
                code: messages_1.MESSAGES.EMAIL_NOT_FOUND,
                message: "Admin not found",
            });
        }
        const match = await bcrypt_1.default.compare(currentPassword, admin.passwordHash);
        if (!match) {
            return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
                code: messages_1.MESSAGES.PASSWORD_MISMATCH,
                message: "Current password is incorrect",
            });
        }
        const hash = await bcrypt_1.default.hash(newPassword, 10);
        admin.passwordHash = hash;
        await admin.save();
        res.status(messages_1.STATUS.OK).json({
            code: messages_1.STATUS.OK,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        res.status(messages_1.STATUS.INTERNAL_SERVER).json({
            code: messages_1.MESSAGES.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
        });
    }
};
exports.changePassword = changePassword;
const changeEmail = async (req, res) => {
    console.log("5555555555555555555");
    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
        return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
            code: messages_1.MESSAGES.FIELDS_REQUIRED,
            message: "newEmail and password are required",
        });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
            code: messages_1.MESSAGES.FIELDS_REQUIRED,
            message: "Invalid email format",
        });
    }
    try {
        const admin = await Admin_1.Admin.findById(req.adminId);
        if (!admin) {
            return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
                code: messages_1.MESSAGES.EMAIL_NOT_FOUND,
                message: "Admin not found",
            });
        }
        const match = await bcrypt_1.default.compare(password, admin.passwordHash);
        if (!match) {
            return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
                code: messages_1.MESSAGES.PASSWORD_MISMATCH,
                message: "Password is incorrect",
            });
        }
        const existingEmail = await Admin_1.Admin.findOne({ email: newEmail });
        if (existingEmail) {
            return res.status(messages_1.STATUS.FIELDS_REQUIRED).json({
                code: messages_1.MESSAGES.FIELDS_REQUIRED,
                message: "Email already exists",
            });
        }
        admin.email = newEmail;
        await admin.save();
        res.status(messages_1.STATUS.OK).json({
            code: messages_1.STATUS.OK,
            message: "Email changed successfully",
        });
    }
    catch (error) {
        res.status(messages_1.STATUS.INTERNAL_SERVER).json({
            code: messages_1.MESSAGES.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
        });
    }
};
exports.changeEmail = changeEmail;
//# sourceMappingURL=authController.js.map