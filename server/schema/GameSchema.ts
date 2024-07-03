import z from "zod";

export const joinGameSchema = z.object({
  room_code: z.string(),
});
