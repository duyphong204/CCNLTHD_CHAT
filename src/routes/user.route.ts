import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { container } from "../container/di-container";

const userRoutes = Router();
const userController = container.getUserController();

userRoutes
  .use(passportAuthenticateJwt)
  .get("/search", userController.searchUsers)
  .get("/me", userController.getMyProfile)
  .get("/all", userController.getUsers)
  .patch("/profile", userController.updateProfile)
  .patch("/change-password", userController.changePassword)
  .get("/:id", userController.getUserProfileById);

export default userRoutes;
