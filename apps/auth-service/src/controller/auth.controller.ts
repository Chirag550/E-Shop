import { NextFunction, Request, Response } from "express";
import { validateRegisterationData } from "../utils/auth.helper";
import prisma from "../../../../packages/libs/prisma";
import { validationError } from "../../../../packages/error-handler";

//Register a new user
export const userRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  validateRegisterationData(req.body, "user");
  const { name, email } = req.body;

  const existingUser = await prisma.users.findUnique({ where: email });

  if (existingUser) {
    return next(new validationError("user already exists with this email!"));
  }

  await checkotpRestictions(email, next);
};
