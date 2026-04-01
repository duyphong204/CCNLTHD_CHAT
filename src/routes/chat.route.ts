import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createChatController,
  getSingleChatController,
  getUserChatsController,
} from "../controllers/chat.controller";
import { sendMessageController } from "../controllers/message.controller";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/message/send", sendMessageController)
  .post("/create", createChatController)
  .get("/all", getUserChatsController)
  .get("/:id", getSingleChatController);

export default chatRoutes;
