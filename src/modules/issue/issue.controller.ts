import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
    try {
        const reporterId = req.params.id;
        const result = await issueService.createIssueInDB(reporterId as string, req.body);

        // console.log(result);

        res.status(200).json({
            success: true,
            message: "Fetched all the issues successfully",
            data: result
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed fetching issues",
            data: {}
        })
    }
}


const getAllIssues = async (req: Request, res: Response) => {

    try {
        const result = await issueService.getAllIssuesFromDB();

        console.log(result);
    } catch (error) {
        
    }
}

export const issueController = {
    createIssue, getAllIssues
}