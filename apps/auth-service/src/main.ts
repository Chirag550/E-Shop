import express from "express";
import cors from "cors";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

app.use(errorMiddleware);
const port = process.env.PORT || 6001;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res, next) => {
  res.json(swaggerDocument);
});
app.use("/api", router);

const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}`);
  console.log(`Swagger Docs available at http://localhost:${port}/docs-json`);
});

server.on("error", (err) => {
  console.log("server Error:", err);
});
