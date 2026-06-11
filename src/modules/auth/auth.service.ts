import { pool } from "../../db";
import type { IUserLogin } from "./auth.interface";

const loginUserInDB = async(payload: any) => {

    const {email, password} = payload;

    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);

    if(userData.rows.length === 0){
        throw new Error("Invalid Credentials");
    }

    const user = userData.rows[0];

    console.log(user);
}

export const authService = {
    loginUserInDB
}