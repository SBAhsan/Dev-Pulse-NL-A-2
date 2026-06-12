import { pool } from "../../db";
import type { IUser } from "./user.interface";
import bcrypt from "bcrypt";

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

const getAllUsersFromDB = async () => {
  const result = await pool.query(`
        SELECT * FROM users
        `);

  for (let i = 0; i < result.rows.length; i++) {
    delete result.rows[i].password;
  }

  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM users WHERE id=$1
        `,
    [id],
  );

  delete result.rows[0].password;

  return result;
};

const updateUserInDB = async (id: string, payload: IUser) => {
  const { email, password } = payload;

  const result = await pool.query(
    `
        UPDATE users
        SET email=$1, password=$2
        WHERE id=$3
        RETURNING *
        `,
    [email, password, id],
  );

  delete result.rows[0].password;

  return result;
};


const deleteUserFromDB = async (id: string) => {
    const result = await pool.query(`
        DELETE FROM users
        WHERE id=$1
        `, [id]);

        return result;
};

export const userService = {
  createUserInDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserInDB,
  deleteUserFromDB
};
