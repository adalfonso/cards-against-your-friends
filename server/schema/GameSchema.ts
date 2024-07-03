import z from "zod";

export const roomCodePayloadSchema = z.object({
  room_code: z.string(),
});
