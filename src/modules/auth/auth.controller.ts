import type { Request, Response } from "express"
import { authService } from "./auth.service"

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserInDB(req.body);

        // // console.log(result)
        // console.log(req);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                accessToken: result.accessToken
            }
        })
    } catch (error) {
        
    }
}

export const authController = {
    loginUser
}