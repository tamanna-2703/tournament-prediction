import {z} from "@hono/zod-openapi";

export const SportRequestSchema = z.object({
  name: z.string(),
})

export const SportResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const getAllSportsResponseSchema = z.array(SportResponseSchema)

export type SportRequest = z.infer<typeof SportRequestSchema>;
export type SportResponse = z.infer<typeof SportResponseSchema>;
export type GetAllSportsResponse = z.infer<typeof getAllSportsResponseSchema>;