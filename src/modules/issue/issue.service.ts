import { pool } from "../../db";

const createIssueInDB = async (reporter_id: string, payload: any) => {
  const {title, description, type } = payload;

  const reporterCheck = await pool.query(
    `
        SELECT id FROM users
        WHERE id=$1
        `,
    [reporter_id],
  );

  console.log(reporter_id);

  if(reporterCheck.rows.length === 0){
    throw new Error("Reporter Does Not Exist")
  }

  const result = await pool.query(
    `
        INSERT INTO issues (title, description, type)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
    [title, description, type],
  );

  return result;
};


const getAllIssuesFromDB = async () => {

}

export const issueService = {
  createIssueInDB, getAllIssuesFromDB
};
