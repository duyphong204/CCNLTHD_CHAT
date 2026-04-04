import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { sendMessageController } from "../controllers/message.controller";
import { container } from "../container/di-container";

const chatRoutes = Router();
const chatController = container.getChatController();

chatRoutes.use(passportAuthenticateJwt).post("/send", sendMessageController);

export default chatRoutes;
