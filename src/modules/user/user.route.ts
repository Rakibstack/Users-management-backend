import { Router, type Request, type Response } from "express";
import userController from "./user.controller";

 const route = Router();

 route.post("/", userController.createUser);

 route.get("/",userController.getAllUser );
 route.get('/:id',userController.getSingleUser)
 route.put("/:id",userController.updateUser);
 route.delete("/:id",userController.deleteUser);


 export const userRoute = route;