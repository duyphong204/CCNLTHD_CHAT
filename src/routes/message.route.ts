import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { container } from "../container/di-container";
const messageController = container.getMessageController();

const chatRoutes = Router();

chatRoutes
  .use(passportAuthenticateJwt)
  .post("/send", messageController.send)
  .put("/:id", messageController.edit)
  .delete("/:id", messageController.delete);

export default chatRoutes;
