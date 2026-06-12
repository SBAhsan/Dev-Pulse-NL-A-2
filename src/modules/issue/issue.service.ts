import { pool } from "../../db";

const createIssueInDB = async (reporter_id: string, payload: any) => {
  const { title, description, type } = payload;

  const reporterCheck = await pool.query(
    `
        SELECT id FROM users
        WHERE id=$1
        `,
    [reporter_id],
  );

  console.log(reporter_id);

  if (reporterCheck.rows.length === 0) {
    throw new Error("Reporter Does Not Exist");
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
  const result = await pool.query(`
        SELECT * FROM issues
        `);

  return result;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM issues
        WHERE id=$1
        `,
    [id],
  );

  return result;
};


const updateIssueInDB = async (id: string, payload: {
    title: string,
    description: string,
    type: string
}) => {
    const {title, description, type} = payload;

    const result = await pool.query(`
        UPDATE issues
        SET title=$1, description=$2, type=$3
        WHERE id=$4
        RETURNING *
        `, [title, description, type, id]);

    return result;
};


const deleteIssueFromDB = async (id: string) => {
    const result = await pool.query(`
        DELETE FROM issues
        WHERE id=$1
        `, [id]);

        return result;
}

export const issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  deleteIssueFromDB
};
