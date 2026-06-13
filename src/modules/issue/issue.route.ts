import { Router } from "express";
import { issueController } from "./issue.controller";
import authMiddleware from "../../middleware/authMiddleware";

const router = Router();

router.post('/', authMiddleware('contributor', 'maintainer'), issueController.createIssue);

router.get("/", issueController.getAllIssues);

router.get("/:id", issueController.getSingleIssue);

router.patch("/:id", authMiddleware('contributor', 'maintainer'), issueController.updateIssue);

router.patch("/:id/status", authMiddleware('maintainer'), issueController.updateIssueStatus);

router.delete("/:id", authMiddleware('maintainer'), issueController.deleteIssue)

export const issueRoute = router;