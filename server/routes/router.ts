import v1 from "./api/v1";
import { Express } from "express";

export const initRouter = (app: Express) => {
  // Register all API routes
  app.use("/api/v1", v1);
};
