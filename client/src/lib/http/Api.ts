import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import { ApiRouter } from "@server/trpc";
import { Socket } from "../websocket/Socket";

export const api = createTRPCProxyClient<ApiRouter>({
  links: [httpBatchLink({ url: "/api/v1/trpc" })],
});

export const preConnect = async () => {
  await api.game.startSession.mutate();
  await Socket.init();
};
