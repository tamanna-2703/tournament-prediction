import {z} from "@hono/zod-openapi"

export const TeamRequestSchema = z.object({
   name: z.string().trim().min(1)
  })

  export const TeamResponseSchema = z.object({
    name: z.string(),
    sportName: z.string(),
  })

  export const getAllTeamsResponseSchema = z.array(TeamResponseSchema)

  export type TeamRequest = z.infer<typeof TeamRequestSchema>
  export type TeamResponse = z.infer<typeof TeamResponseSchema> 
  export type GetAllTeamsResponse = z.infer<typeof getAllTeamsResponseSchema>
    