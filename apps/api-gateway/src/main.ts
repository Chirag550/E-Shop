import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import cookieparser from "cookie-parser";
import * as path from "path";
import initializeSiteConfig from "./libs/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieparser());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: "Too many requests, Please try again later" },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
});
app.use(limiter);

app.use("/product", proxy("http://localhost:6002"));
app.use("/", proxy("http://localhost:6001"));

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
   try {
    initializeSiteConfig();
    console.log("✅ Site config initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize site config:", error);
  }
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on("error", console.error);
