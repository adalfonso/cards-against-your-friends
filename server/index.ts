import express, { Request } from "express";

import { init } from "./init";
(async () => {
  const app = express();
  const { env, wss, sessionParser } = await init(app);

  // Must run after history fallback
  app.use(express.static(env.SOURCE_DIR));

  // Start server
  const server = app.listen(env.NODE_PORT, () => {
    console.info(`Server started: ${env.HOST}:${env.NODE_PORT}`);
    console.info(`Serving content from ${env.SOURCE_DIR}`);
  });

  server.on("upgrade", (req: Request, socket, head) => {
    socket.on("error", console.error);

    console.info("Parsing session from request...");

    sessionParser(req, {} as any, () => {
      if (!req.session.user_id) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      console.info("Session is parsed!");

      socket.removeListener("error", console.error);

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    });
  });
})();
