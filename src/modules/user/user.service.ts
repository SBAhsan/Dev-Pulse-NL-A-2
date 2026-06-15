import { pool } from "../../db";
import bcrypt from "bcrypt";



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
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserInDB,
  deleteUserFromDB
};
