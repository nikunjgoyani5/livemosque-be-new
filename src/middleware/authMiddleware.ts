import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (
  req: Request | any,
  res: Response,
  next: NextFunction
) => {
  // Check token from Authorization header or cookies
  let token = req.headers.authorization?.split(" ")[1];

  // Parse token from cookie string if not in Authorization header
  if (!token && req.headers?.cookie) {
    const cookies = req.headers.cookie.split("; ");
    const tokenCookie = cookies.find((cookie: string) =>
      cookie.startsWith("token=")
    );
    if (tokenCookie) {
      token = tokenCookie.split("=")[1];
    }
  }

  if (!token) return res.status(401).json({ message: "Not authorized" });
  console.log("token", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    req.adminId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};
