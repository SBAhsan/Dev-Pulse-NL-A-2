import { Router } from "express";
import { issueController } from "./issue.controller";

const router = Router();

router.post('/:id', issueController.createIssue);

export const issueRoute = router;