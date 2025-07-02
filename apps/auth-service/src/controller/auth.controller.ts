import { NextFunction, Request, Response } from "express";
import {
  checkotpRestictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegisterationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { AuthError, validationError } from "../../../../packages/error-handler";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import { PassThrough } from "stream";

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

//verify user with otp

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new validationError("All fields are required"));
    }

    const exisitingUser = await prisma.users.findUnique({ where: { email } });

    if (exisitingUser)
      return new validationError("User already exists with this email");

    await verifyOtp(email, otp, next);

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { name, email, password: hashPassword },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return next(error);
  }
};

//login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new validationError("Email and password are required"));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return next(new AuthError("user doesn't exist"));

    //verify password

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    //generate access token and referesh token

    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_JWT_SECRET as string,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    //store the refresh and access token in http only secure cookie
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "Login successfull",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

//refresh token
// refresh token
export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] || req.headers.authorization?.split(" ")[1];

    if (!refreshToken) {
      return next(new validationError("Unauthorized! No refresh token."));
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError("Forbidden! Invalid refresh token."));
    }

    const user = await prisma.users.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return next(new AuthError("Forbidden! User/Seller not found"));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    setCookie(res, "access_token", newAccessToken);

    return res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    console.log("ingetuser");

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await handleForgotPassword(req, res, next, "user");
};
//verify user-forgot-Password otp
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

//reset-user-passsword
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    console.log(email, newPassword);
    if (!email || !newPassword)
      return next(new validationError("Email and new password are required"));

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) return next(new validationError("User doesn't exist"));

    //compare new password

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword)
      return next(
        new validationError(
          "New password cannot be the same as the old password"
        )
      );

    //hash the new password

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      success: true,
      message: "password reset succesfully",
    });
  } catch (error) {
    next(error);
  }
};
