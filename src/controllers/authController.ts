import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin";
import { MESSAGES, STATUS } from "../helper/messages";

export const loginAdmin = async (req: Request, res: Response) => {
  const { email = "", password = "" } = req?.body || {};

  if (!email || !password) {
    return res.status(STATUS.FIELDS_REQUIRED).json({
      code: MESSAGES.FIELDS_REQUIRED,
      message: "email and password is required",
    });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin)
      return res
        .status(STATUS.FIELDS_REQUIRED)
        .json({ code: MESSAGES.EMAIL_NOT_FOUND, message: "email not found" });

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match)
      return res.status(STATUS.FIELDS_REQUIRED).json({
        code: MESSAGES.PASSWORD_MISMATCH,
        message: "please enter valid credentials",
      });

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    res
      .status(STATUS.OK)
      .json({ code: STATUS.OK, message: MESSAGES.LOGIN_SUCCESS, token });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER).json({
      code: MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(STATUS.FIELDS_REQUIRED).json({
      code: MESSAGES.FIELDS_REQUIRED,
      message: "currentPassword and newPassword are required",
    });
  }

  if (newPassword.length < 6) {
    return res.status(STATUS.FIELDS_REQUIRED).json({
      code: MESSAGES.FIELDS_REQUIRED,
      message: "newPassword must be at least 6 characters",
    });
  }

  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(STATUS.FIELDS_REQUIRED).json({
        code: MESSAGES.EMAIL_NOT_FOUND,
        message: "Admin not found",
      });
    }

    const match = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!match) {
      return res.status(STATUS.FIELDS_REQUIRED).json({
        code: MESSAGES.PASSWORD_MISMATCH,
        message: "Current password is incorrect",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    admin.passwordHash = hash;
    await admin.save();

    res.status(STATUS.OK).json({
      code: STATUS.OK,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER).json({
      code: MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};

export const changeEmail = async (req: any, res: Response) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    return res.status(STATUS.FIELDS_REQUIRED).json({
      code: MESSAGES.FIELDS_REQUIRED,
      message: "newEmail and password are required",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(STATUS.FIELDS_REQUIRED).json({
      code: MESSAGES.FIELDS_REQUIRED,
      message: "Invalid email format",
    });
  }

  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(STATUS.FIELDS_REQUIRED).json({
        code: MESSAGES.EMAIL_NOT_FOUND,
        message: "Admin not found",
      });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(STATUS.FIELDS_REQUIRED).json({
        code: MESSAGES.PASSWORD_MISMATCH,
        message: "Password is incorrect",
      });
    }

    const existingEmail = await Admin.findOne({ email: newEmail });
    if (existingEmail) {
      return res.status(STATUS.FIELDS_REQUIRED).json({
        code: MESSAGES.FIELDS_REQUIRED,
        message: "Email already exists",
      });
    }

    admin.email = newEmail;
    await admin.save();

    res.status(STATUS.OK).json({
      code: STATUS.OK,
      message: "Email changed successfully",
    });
  } catch (error) {
    res.status(STATUS.INTERNAL_SERVER).json({
      code: MESSAGES.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  }
};
