import dotenv from "dotenv";
import express from "express";
import connecDB from "./config/database.config";
import morgan from "morgan";
import rootRouter from "./routes/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(morgan("dev"));

app.use("/api", rootRouter);

app.get("/", (req, res) => {
  res.send("Server đang chạy ngon luôn!");
});
const startServer = async () => {
  try {
    await connecDB();

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Lỗi khởi động hệ thống:", error);
    process.exit(1);
  }
};

startServer();
