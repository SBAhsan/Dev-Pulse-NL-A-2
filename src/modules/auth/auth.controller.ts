import type { Request, Response } from "express"
import { authService } from "./auth.service"

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserInDB(req.body);

        const {refreshToken} = result;

        res.cookie("refreshToken", refreshToken, {
            secure: false,
            httpOnly: true,
            sameSite: 'lax'
        })

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: result
        })
    } catch (error) {
        
    }
}

export const authController = {
    loginUser
}