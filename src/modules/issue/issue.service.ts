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

  if (reporterCheck.rows.length === 0) {
    throw new Error("Reporter Does Not Exist");
  }

  const result = await pool.query(
    `
        INSERT INTO issues (title, description, type, reporter_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
    [title, description, type, reporter_id],
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
  const issueDetails = await pool.query(
    `
        SELECT * FROM issues
        WHERE id=$1
        `,
    [id],
  );

  if (issueDetails.rows.length === 0) {
    throw new Error("Issue not found.");
  }

  const issue = issueDetails.rows[0];

  const reporterDetails = await pool.query(
    `
    SELECT * FROM users WHERE id=$1
    `,
    [issue.reporter_id],
  );

  const reporter = reporterDetails.rows[0];

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: {
      id: reporter.id,
      name: reporter.name,
      role: reporter.role,
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssueInDB = async (
  id: string,
  payload: {
    title: string;
    description: string;
    type: string;
  },
) => {
  const { title, description, type } = payload;

  const result = await pool.query(
    `
        UPDATE issues
        SET title=$1, description=$2, type=$3
        WHERE id=$4
        RETURNING *
        `,
    [title, description, type, id],
  );

  return result;
};

const updateIssueStatusInDB = async (id: string, status: string) => {
  const allStatus = ["open", "in_progress", "resolved"];

  if (!allStatus.includes(status)) {
    throw new Error("Invalid status");
  }

  const updateStatus = await pool.query(
    `
        UPDATE issues
        SET status=$1
        WHERE id=$2
        RETURNING *
        `,
    [status, id],
  );

  if (updateStatus.rows.length === 0) {
    throw new Error("Issue not found");
  }

  const result = updateStatus.rows[0];

  return result;
};

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
        DELETE FROM issues
        WHERE id=$1
        `,
    [id],
  );

  return result;
};

export const issueService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueInDB,
  updateIssueStatusInDB,
  deleteIssueFromDB,
};
