import { Router, type Request, type Response } from "express";
import userController from "./user.controller";
import auth from "../../middleware/auth";

 const route = Router();

 route.post("/", userController.createUser);

 route.get("/",auth(),userController.getAllUser );
 route.get('/:id',userController.getSingleUser)
 route.put("/:id",userController.updateUser);
 route.delete("/:id",userController.deleteUser);


 export const userRoute = route;