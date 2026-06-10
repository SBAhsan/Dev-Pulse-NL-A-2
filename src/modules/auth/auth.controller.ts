import type { Request, Response } from "express"
import { log } from "node:console"
import { authService } from "./auth.service"

const loginUser = async (req: Request, RES: Response) => {
    try {
        const result = await authService.loginUserInDB(req.body);
    } catch (error) {
        
    }
}

export const authController = {
    loginUser
}