import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { container } from "../container/di-container";

const authRoutes = Router();
const authController = container.getAuthController();

authRoutes
  .post("/register", authController.register)
  .post("/login", authController.login)
  .post("/logout", authController.logout)
  .get("/status", passportAuthenticateJwt, authController.authStatus);

export default authRoutes;
