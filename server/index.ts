import express from "express";
import { init } from "./init";
(async () => {
  const app = express();
  const { env, wss } = await init(app);

  // Must run after history fallback
  app.use(express.static(env.SOURCE_DIR));

  // Start server
  const server = app.listen(env.NODE_PORT, () => {
    console.info(`Server started: ${env.HOST}:${env.NODE_PORT}`);
    console.info(`Serving content from ${env.SOURCE_DIR}`);
  });

  server.on("upgrade", (req, socket, head) =>
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit("connection", ws, req)
    )
  );
})();
