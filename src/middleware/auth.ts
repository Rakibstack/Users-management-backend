import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import { pool } from "../db";

 type Role = "admin" | "agent";

const auth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        res.status(401).json({
          success: false,
          message: "unauthorized access!",
        });
        return;
      }
      const decoded = jwt.verify(
        token as string,
        config.jwt_secret_key,
      ) as JwtPayload;

      const userData = await pool.query(
        `
       SELECT * FROM users WHERE email = $1 
        `,
        [decoded.email],
      );

      if (userData.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User Not Found",
        });
        return;
      }

      const user = userData.rows[0];

      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: "Forbidden Access!",
        });
        return;
      }

      if (roles.length && !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden Access!",
        });
        return;
      }

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
