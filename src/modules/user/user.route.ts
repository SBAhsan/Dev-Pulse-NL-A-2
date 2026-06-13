import { Router } from "express";
import { userController } from "./user.controller";
import authMiddleware from "../../middleware/authMiddleware";

const router = Router();

router.post('/', userController.createUser);

router.get('/', authMiddleware(), userController.getAllUsers);

router.get('/:id', userController.getSingleUser);

router.put('/:id', userController.updateUser);

router.delete('/:id', userController.deleteUser);

export const userRoute = router;
