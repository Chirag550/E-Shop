import express, { Router } from "express";
import { userRegisteration } from "../controller/auth.controller";

const router: Router = express.Router();

router.post("/user-registeration", userRegisteration);

export default router;
