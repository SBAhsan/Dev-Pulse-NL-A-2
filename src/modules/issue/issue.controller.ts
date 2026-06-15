import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { pool } from "../../db";
import sendResponse from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    // const { id } = req.params;
    const reporter_id = (req as any).user.id;

    const result = await issueService.createIssueInDB(
      reporter_id as string,
      req.body,
    );

    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Issue created successfully",
        data: result.rows,
      });
    } else {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Failed creating issue",
        data: {},
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssuesFromDB();

    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Issues retrieved successfully",
        data: result.rows,
      });
    } else {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Failed retrieving issues",
        data: {},
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issueService.getSingleIssueFromDB(id as string);

    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Issue retrieved successfully",
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Failed retrieving issue",
        data: {},
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (user.role === "contributor") {
      const issue = await pool.query(
        `
            SELECT * FROM issues WHERE id=$1
            `,
        [id],
      );

      if (issue.rows[0].status !== "open") {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "This issue is not open",
        });
      }

      if (issue.rows.length === 0) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "Issue not found",
        });
      }

      if (issue.rows[0].reporter_id !== user.id) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "You can only update your own issues",
        });
      }
    }

    const result = await issueService.updateIssueInDB(id as string, req.body);

    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Issue updated successfully",
        data: result.rows,
      });
    } else {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Failed updating issue",
        data: {},
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const updateIssueStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issueService.updateIssueStatusInDB(
      id as string,
      req.body.status,
    );
    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Issue status updated successfully",
        data: result,
      });
    } else {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Failed updating issue status",
        data: {},
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issueService.deleteIssueFromDB(id as string);

    if (result) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Issue deleted successfully",
      });
    } else {
      sendResponse(res, {
        statusCode: 401,
        success: false,
        message: "Failed deleting issue",
      });
    }
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
};
