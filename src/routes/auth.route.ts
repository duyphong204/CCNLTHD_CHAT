import { Router } from "express";
import {
  loginController,
  logoutController,
  registerController,
  authStatusController,
} from "../controllers/auth.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Xac thuc nguoi dung
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Dang ky tai khoan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dang ky thanh cong
 *       400:
 *         description: Du lieu dau vao khong hop le
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Dang nhap
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dang nhap thanh cong
 *       401:
 *         description: Sai thong tin dang nhap
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Dang xuat
 *     responses:
 *       200:
 *         description: Dang xuat thanh cong
 */

/**
 * @openapi
 * /auth/status:
 *   post:
 *     tags: [Auth]
 *     summary: Kiem tra trang thai xac thuc
 *     responses:
 *       200:
 *         description: Nguoi dung da xac thuc
 *       401:
 *         description: Chua dang nhap hoac token khong hop le
 */

const authRoutes = Router()
  .post("/register", registerController)
  .post("/login", loginController)
  .post("/logout", logoutController)
  .post("/status", passportAuthenticateJwt, authStatusController);

export default authRoutes;
