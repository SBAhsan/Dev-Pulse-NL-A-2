import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import { userService } from "../user/user.service";

const createIssue = async (req: Request, res: Response) => {
  try {
    const reporterId = req.params.id;
    const result = await issueService.createIssueInDB(
      reporterId as string,
      req.body,
    );

    // console.log(result);

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
        const {id} = req.params;

        const result = await issueService.updateIssueInDB(id as string, req.body);

        console.log(result.rows);
    } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue
};
