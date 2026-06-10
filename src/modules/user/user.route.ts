import { Router, type Request, type Response } from "express";
import userController from "./user.controller";
import auth from "../../middleware/auth";
import { user_Role } from "../../types";

 const route = Router();

 route.post("/", userController.createUser);

 route.get("/",auth(user_Role.admin,user_Role.agent),userController.getAllUser );
 route.get('/:id',userController.getSingleUser)
 route.put("/:id",userController.updateUser);
 route.delete("/:id",userController.deleteUser);


 export const userRoute = route;