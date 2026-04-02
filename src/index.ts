import cookieParser from "cookie-parser";
import path from "path";
import { Env } from "./config/env.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import passport, { initialize } from "passport";
import "./config/passport.config";
import http from "http";
import { initializeSocket } from "./lib/socket";
// import viewRoutes from './routes/view.route'
import connecDB from "./config/database.config";
import rootRouter from "./routes/index";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";
import cors from 'cors'
import express, { Request, Response } from 'express'
import 'dotenv/config'

const app = express();
const server = http.createServer(app);

// socket
initializeSocket(server);

// Cấu hình EJS Engine
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// Cấu hình thư mục static cho CSS, JS, images
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: Env.FRONTEND_ORIGIN,
  credentials: true
}))
app.use(passport.initialize());

app.use(passport.initialize())

// Routes API
app.use("/api", rootRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

server.listen(Env.PORT, async () => {
  await connecDB()
  console.log(`server running ${Env.PORT}`)
})
