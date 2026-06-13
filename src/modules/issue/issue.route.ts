import { Router } from "express";
import { issueController } from "./issue.controller";
import authMiddleware from "../../middleware/authMiddleware";

const router = Router();

router.post('/:id', authMiddleware('contributor', 'maintainer'), issueController.createIssue);

router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getSingleIssue);
router.put("/:id", issueController.updateIssue);
router.delete("/:id", issueController.deleteIssue)

export const issueRoute = router;