import config from "../../config";
import { pool } from "../../db";
import type { IUser, IUserLogin } from "./auth.interface";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

const createUserInDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role],
  );

  delete result.rows[0].password;

  return result;
};

const loginUserInDB = async (payload: IUserLogin) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials");
  }

  const user = userData.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.access_key, {
    expiresIn: config.access_token_expires_in as any,
  });

  const refreshToken = jwt.sign(jwtPayload, config.refresh_key, {
    expiresIn: config.refresh_token_expires_in as any,
  });

  return { accessToken, refreshToken };
};

const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("Unauthorized access!");
  }

  const decodeToken = jwt.verify(
    token as string,
    config.refresh_key,
  ) as JwtPayload;

  const userData = await pool.query(
    `
        SELECT * FROM users
        WHERE email=$1
        `,
    [decodeToken.email],
  );

  if (userData.rows.length === 0) {
    throw new Error("User not found.");
  }

  const user = userData.rows[0];

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.access_key, {
    expiresIn: config.access_token_expires_in as any,
  });

  return { accessToken };
};

export const authService = {
  createUserInDB,
  loginUserInDB,
  generateRefreshToken,
};
