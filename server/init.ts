import dotenv from "dotenv";
import express, { Express } from "express";
import session from "express-session";
import cookieParser from "cookie-parser";

import { initRouter } from "@routes/router";
import { createWebSocketServer } from "./lib/io/WebSocketServer";

declare module "express-session" {
  interface Session {
    user_id: string;
  }
}

/**
 * Initialize the express app
 *
 * @param app - express app
 * @returns env var store
 */
export const init = async (app: Express) => {
  const env = initEnvVars();

  const sessionParser = session({
    saveUninitialized: false,
    secret: env.APP_KEY,
    resave: false,
  });

  app.use(sessionParser);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  initRouter(app);
  const wss = createWebSocketServer();

  return { env, wss, sessionParser };
};

// List of required env vars
const required_vars = [
  "HOST",
  "DATABASE_URL",
  "NODE_ENV",
  "NODE_PORT",
  "SOURCE_DIR",
  "APP_KEY",
  ...(process.env.NODE_ENV === "production" ? ["SSL_PATH"] : []),
] as const;

const defaults: Record<string, string> = {
  NODE_ENV: "development",
  NODE_PORT: "4200",
  SOURCE_DIR: "dist/client",
} as const;

export type EnvStore = {
  [K in (typeof required_vars)[number]]: string;
};

// "Singleton" that stores all the env vars
// TODO: make this an actual singleton class
export const env = Object.fromEntries(
  required_vars.map((key) => [key, ""])
) as EnvStore;

/** Initialize env vars */
const initEnvVars = () => {
  dotenv.config();

  // Check for required env vars
  required_vars.map((key) => {
    const value = process.env[key] ?? defaults[key];

    if (value === undefined) {
      throw new Error(`Missing env value for ${key}`);
    }

    env[key] = value;
  });

  return env;
};
