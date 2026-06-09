import express, {
  text,
  type Application,
  type Request,
  type Response,
} from "express";

import { userRoute } from "./modules/user/user.route";

const app: Application = express();
app.use(express.json())


app.get("/", (req: Request, res: Response) => {
  
  res.send("Hello World!!");
});

app.use('/api/users',userRoute)




export default app;
