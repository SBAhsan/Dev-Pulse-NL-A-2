import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { pool } from "../../db";

const createIssue = async (req: Request, res: Response) => {
  try {
    // const { id } = req.params;
    const reporter_id = (req as any).user.id;

    const result = await issueService.createIssueInDB(
      reporter_id as string,
      req.body,
    );

    if (result) {
      res.status(200).json({
        success: true,
        message: "Reported issue successfully",
        data: result.rows,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Failed reporting issue",
        data: {},
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssuesFromDB();

    if (result) {
      res.status(200).json({
        success: true,
        message: "Fetched all the issues successfully",
        data: result.rows,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Failed fetching issues",
        data: {},
      });
    }
  } catch (error: any) {
    res.status(500).json({
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
      res.status(200).json({
        success: true,
        message: "Fetched the issue successfully",
        data: result.rows,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Failed fetching issue",
        data: {},
      });
    }
  } catch (error: any) {
    res.status(500).json({
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

      if(issue.rows[0].status !== "open"){
        return res.status(403).json({
          success: false,
          message: "This issue is not open",
        });
      }

      if (issue.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Issue not found" });
      }

      if (issue.rows[0].reporter_id !== user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own issues",
        });
      }
    }

    const result = await issueService.updateIssueInDB(id as string, req.body);

    if (result) {
      res.status(200).json({
        success: true,
        message: "Issue updated successfully",
        data: result.rows,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Failed updating issue",
        data: {},
      });
    }
  } catch (error: any) {
    res.status(500).json({
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
      res.status(200).json({
        success: true,
        message: "Issue status updated successfully",
        data: result,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Failed updating issue status",
        data: {},
      });
    }
  } catch (error: any) {
    res.status(500).json({
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
      res.status(200).json({
        success: true,
        message: "Issue deleted successfully",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Failed deleting issue",
      });
    }
  } catch (error: any) {
    res.status(500).json({
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
