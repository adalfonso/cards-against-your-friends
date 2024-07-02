import z from "zod";

export const addOrUpdateUserSchema = z.object({
  nickname: z.string(),
  room_code: z.string(),
});

export const joinGameSchema = z.object({
  room_code: z.string(),
});
