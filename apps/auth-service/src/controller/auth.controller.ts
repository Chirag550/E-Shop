import { NextFunction, Request, Response } from "express";
import {
  checkotpRestictions,
  sendOtp,
  trackOtpRequests,
  validateRegisterationData,
} from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { validationError } from "../../../../packages/error-handler";

//Register a new user
export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegisterationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new validationError("user already exists with this email!"));
    }

    await checkotpRestictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your email",
    });
  } catch (error) {
    return next(error);
  }
};
