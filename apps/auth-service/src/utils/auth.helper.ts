import crypto from "crypto";
import { validationError } from "../../../../packages/error-handler";
import { NextFunction, Request, Response } from "express";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";
import prisma from "../../../../packages/libs/prisma";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new validationError("Missing Required Fields!");
  }
  if (!emailRegex.test(email)) {
    throw new validationError("Invalid email format!");
  }
};
export const checkotpRestictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new validationError(
      "Account locked due to multiple failed attempts! Try again later 30 minutes "
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new validationError(
      "Too many otp requests! Please wait for 1 hour before requesting again"
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new validationError(
      "Please wait one minute before requesting a new otp!"
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
    throw new validationError(
      "Too many OTP requests. Please wait 1 hour before requesting again."
    );
  }

  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600); //Track request for 1 hour
};
export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify Your Email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) throw new validationError("Invalid or expired OTP!");

  const failedAttemptsKey = `otp_attemps:${email}`;

  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");
  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); //locked for 30 minutes
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new validationError(
        "Too many failed attemps. Your account is locked for 30 minutes "
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw new validationError(
      `Incorrect OTP. ${2 - failedAttempts} attempts left`
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;

    if (!email) throw new validationError("Email is required");

    //Find user/seller in DB
    const user =
      userType == "user" &&
      (await prisma.users.findUnique({ where: { email } }));

    if (!user) throw new validationError(`${userType} not found`);

    //check otp restrictions
    await checkotpRestictions(email, next);
    await trackOtpRequests(email, next);

    //generate OTP and send Email
    await sendOtp(
      user.name,
      email,
      userType === "user"
        ? "forgot-password-user-email"
        : "forgot-password-seller-email"
    );

    res
      .status(200)
      .json({ message: "OTP send to email , Please verify your account" });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      throw new validationError("Email and otp are required!");
    await verifyOtp(email, otp, next);

    res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password" });
  } catch (error) {
    next(error);
  }
};
