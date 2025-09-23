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
