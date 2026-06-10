import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const createIssue = async (req: Request, res: Response) => {
    try {
        const reporterId = req.params.id;
        const result = await issueService.createIssueInDB(reporterId as string, req.body);

        console.log(result);
    } catch (error) {
        
    }
}

export const issueController = {
    createIssue
}