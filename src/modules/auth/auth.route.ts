import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post('/register', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/refresh-token', authController.refreshToken)

export const authRoute = router;