import dotenv from "dotenv";
import express, { Express } from "express";
import { WebSocket, WebSocketServer } from "ws";
import cookieParser from "cookie-parser";

import { initRouter } from "@routes/router";
import { Database as db } from "./lib/data/Database";
import { randomUUID } from "crypto";

const clients: Record<string, { ws: WebSocket }> = {};

/**
 * Initialize the express app
 *
 * @param app - express app
 * @returns env var store
 */
export const init = async (app: Express) => {
  const env = initEnvVars();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  initRouter(app);

  const wss = new WebSocketServer({ port: 4202 });

  wss.on("connection", async (ws) => {
    const id = randomUUID;
    clients[id] = { ws };

    ws.on("error", console.error);

    ws.on("message", (data) => {
      console.log("received: %s", data);
    });

    ws.send(JSON.stringify({ id }));

    // const doc = await db.instance().game.create({ data: { code: "abcd" } });

    console.log(db.instance());
    const count = await db.instance().game.create({ data: { code: "abcd" } });

    console.log({ count });

    console.log({ clients });
  });

  return env;
};

// List of required env vars
const required_vars = [
  "APP_PORT",
  "HOST",
  "DATABASE_URL",
  "NODE_ENV",
  "NODE_PORT",
  "SOURCE_DIR",
] as const;

const defaults: Record<string, string> = {
  APP_PORT: "4200",
  NODE_ENV: "development",
  NODE_PORT: "4201",
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
