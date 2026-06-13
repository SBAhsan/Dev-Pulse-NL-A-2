import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const authMiddleware = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.headers.authorization);

    const token = req.headers.authorization;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access!",
      });
    }

    const decodeToken = jwt.verify(token as string, config.access_key) as JwtPayload;

    console.log(decodeToken);

    const userData = await pool.query(`
        SELECT * FROM users
        WHERE email=$1
        `, [decodeToken.email]);

    if(userData.rows.length === 0){
        res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userData.rows[0];

    (req as any).user = user;

    if(roles.length > 0 && !roles.includes(user.role)){
        return res.status(403).json({
        success: false,
        message: "Forbidden! You do not have permission.",
      });
    }

    next();
  };
};

export default authMiddleware;
