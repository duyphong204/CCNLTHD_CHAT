import cookieParser from "cookie-parser";
import path from "path";
import { Env } from "./config/env.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import passport, { initialize } from "passport";
import "./config/passport.config";
import http from "http";
import { initializeSocket } from "./lib/socket";
// import viewRoutes from './routes/view.route'
import dotenv from "dotenv";
import express from "express";
import connecDB from "./config/database.config";
import rootRouter from "./routes/index";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";

dotenv.config();

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

app.use(passport.initialize());

// Routes views
// app.use("/", viewRoutes);

// Routes API
app.use("/api", rootRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

const startServer = async () => {
  try {
    await connecDB();

    app.listen(Env.PORT, () => {
      console.log(`Server is running at http://localhost:${Env.PORT}`);
    });
  } catch (error) {
    console.error("Lỗi khởi động hệ thống:", error);
    process.exit(1);
  }
};

startServer();
