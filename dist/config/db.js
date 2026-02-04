"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const Admin_1 = require("../models/Admin");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const existing = await Admin_1.Admin.findOne({ email: adminEmail });
        if (!existing) {
            const hash = await bcrypt_1.default.hash(adminPassword, 10);
            await Admin_1.Admin.create({ email: adminEmail, passwordHash: hash });
            console.log("Admin seeded");
        }
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map