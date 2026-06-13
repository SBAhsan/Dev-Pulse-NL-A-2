import type { NextFunction, Request, Response } from "express";

const authMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers.authorization);

    const token = req.headers.authorization;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access!",
      });
    }
    next();
  };
};

export default authMiddleware;
