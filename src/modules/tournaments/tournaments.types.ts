import {z} from '@hono/zod-openapi'

export const TournamentRequestSchema = z.object({
  name: z.string().trim().min(1),
  entryFee: z.number().int().positive(),
})

export const TournamentResponseSchema = z.object({
  name: z.string(),
  sportName: z.string(),
  entryFee: z.number(),
})

export const getAllTournamentsResponseSchema = z.array(TournamentResponseSchema)

export type TournamentRequest = z.infer<typeof TournamentRequestSchema>
export type TournamentResponse = z.infer<typeof TournamentResponseSchema>
export type getAllTournamentsResponse = z.infer<typeof getAllTournamentsResponseSchema>