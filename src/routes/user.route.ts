import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { container } from "../container/di-container";

const userRoutes = Router();
const userController = container.getUserController();

userRoutes
  .use(passportAuthenticateJwt)
  .get("/me", userController.getMyProfile)
  .get("/all", userController.getUsers)
  .get("/:id", userController.getUserProfileById)
  .patch("/profile", userController.updateProfile)
  .patch("/change-password", userController.changePassword);

export default userRoutes;
