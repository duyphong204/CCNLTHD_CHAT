import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createChatController,
  getSingleChatController,
  getUserChatsController,
} from "../controllers/chat.controller";

/**
 * @openapi
 * tags:
 *   - name: Chat
 *     description: Quan ly cuoc tro chuyen
 */

/**
 * @openapi
 * /chat/create:
 *   post:
 *     tags: [Chat]
 *     summary: Tao chat 1-1 hoac group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *               isGroup:
 *                 type: boolean
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *               groupName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tao hoac lay cuoc tro chuyen thanh cong
 *       401:
 *         description: Chua xac thuc
 */

/**
 * @openapi
 * /chat/all:
 *   get:
 *     tags: [Chat]
 *     summary: Lay danh sach cuoc tro chuyen cua nguoi dung
 *     responses:
 *       200:
 *         description: Lay danh sach thanh cong
 *       401:
 *         description: Chua xac thuc
 */

/**
 * @openapi
 * /chat/{id}:
 *   get:
 *     tags: [Chat]
 *     summary: Lay chi tiet cuoc tro chuyen theo id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lay chi tiet cuoc tro chuyen thanh cong
 *       400:
 *         description: Khong tim thay chat hoac khong co quyen
 *       401:
 *         description: Chua xac thuc
 */

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .get("/all", getUserChatsController)
  .get("/:id", getSingleChatController);

export default chatRoutes;
