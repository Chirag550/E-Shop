import prisma from "../libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log("in isauthenticated");
    console.log("Cookies received:", req.cookies);
    const token = req.cookies.access_token;
    console.log(token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET!) as {
      id: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized! Invalid token.",
      });
    }

    const account = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!account) {
      return res.status(401).json({ message: "Account not found!" });
    }
    console.log(account);
    req.user = account;
    return next();
  } catch (error) {
    console.error("Auth error:", error);
    return res
      .status(401)
      .json({ message: "Unauthorized! Invalid or expired token." });
  }
};

export default isAuthenticated;
