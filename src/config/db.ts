import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Admin } from "../models/Admin";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    const adminEmail = process.env.ADMIN_EMAIL!;
    const adminPassword = process.env.ADMIN_PASSWORD!;
    const existing = await Admin.findOne({ email: adminEmail });
    if (!existing) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await Admin.create({ email: adminEmail, passwordHash: hash });
      console.log("Admin seeded");
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
