import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";
import { issueRoute } from "./modules/issue/issue.route";
import { authRoute } from "./modules/auth/auth.route";

export const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Everything is okay!",
  });
});

app.use('/api/users', userRoute);
app.use('/api/issues', issueRoute);
app.use('/api/auth', authRoute);


export default app;
