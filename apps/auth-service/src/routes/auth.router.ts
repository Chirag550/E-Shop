import express, { Router } from "express";
import {
  loginUser,
  userRegisteration,
  verifyUser,
} from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-registeration", userRegisteration);
router.post("/verify-user", verifyUser);
router.post("/login-user", loginUser);

export default router;
