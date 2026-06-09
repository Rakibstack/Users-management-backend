import { Router } from "express";
import { profileController } from "./profile.controller";

const route = Router()

route.post('/',profileController.createProfile)

  

 export const profileRoute = route