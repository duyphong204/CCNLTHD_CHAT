import { Router } from "express";

import viewRoutes from "./view.route";
import authRoutes from "./auth.route";
import chatRoutes from "./chat.route";
import messageRoutes from "./message.route";

const router = Router();
router.use("/", viewRoutes);
router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/message", messageRoutes);

export default router;
