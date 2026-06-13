import type { NextFunction, Request, Response } from "express"

const authMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.headers.authorization);

        
        next();
    }
};


export default authMiddleware;