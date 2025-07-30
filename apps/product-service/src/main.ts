/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import * as path from 'path';
import productRoutes from './routes/product.routes';

const app = express();
app.use(express.json({ limit: "50mb" })); // Reduced from 100mb for security
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use('/assets', express.static(path.join(__dirname, 'assets')));


app.get("/", (req, res) => {
  res.json({ message: "Product service is running" });
});
app.use("/api", productRoutes);
app.use(errorMiddleware);
const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
