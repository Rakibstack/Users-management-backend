import express, {
  text,
  type Application,
  type Request,
  type Response,
} from "express";

import { userRoute } from "./modules/user/user.route";
import { profileRoute } from "./modules/profile/profile.route";
import { authRoute } from "./modules/auth/auth.route";
import logger from "./middleware/logger";
import cookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(cors({origin: "http://localhost:3000"}));

app.use(logger);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!");
});

app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/auth", authRoute);

app.use(globalErrorHandler);

export default app;
