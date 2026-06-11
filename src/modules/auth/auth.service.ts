import { pool } from "../../db";
import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config/env";

const logginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const userExist = await pool.query(
    `   
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );

  if (userExist.rows.length === 0) {
    throw new Error("User Not Found");
  }
  const user = userExist.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("invalid credentials");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_secret_key, {
    expiresIn: config.expire_time as any,
  });
  const refreshToken = jwt.sign(jwtPayload, config.jwt_refresh_secret_key, {
    expiresIn: config.expire_time as any,
  });

  return { accessToken, refreshToken };
};

const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("unauthorized access!");
  }
  const decoded = jwt.verify(
    token as string,
    config.jwt_refresh_secret_key,
  ) as JwtPayload;

  const userData = await pool.query(
    `
       SELECT * FROM users WHERE email = $1 
        `,
    [decoded.email],
  );

  if (userData.rows.length === 0) {
    throw new Error("User Not Found");
  }

  const user = userData.rows[0];

  if (!user.is_active) {
    throw new Error("Forbidden Access!");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_active: user.is_active,
  };

  const accessToken = jwt.sign(jwtPayload , config.jwt_secret_key , {
    expiresIn: config.expire_time as any,
  });
  return { accessToken };
};

export const authService = {
  logginUserIntoDB,
  generateRefreshToken,
};
