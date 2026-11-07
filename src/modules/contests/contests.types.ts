import {z} from "@hono/zod-openapi"
import {ContestStatus } from "@/db/types"



export const ContestRequestSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
})

export const ContestResponseSchema = z.object({
  id: z.string(),
  tournamentId: z.string(),
  tournamentName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(ContestStatus),
  prizePool: z.number(),
  createdAt: z.string(),
})

export const  ContestCloseResponseSchema = z.object({
  message: z.string(),
  contest: ContestResponseSchema,
})

export const LeaderboardEntryResponseSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  score: z.number(),
  rank: z.number(),
  prize: z.number(),
  createdAt: z.string(),
})

export const getAllContestsResponseSchema = z.array(ContestResponseSchema)
export type ContestRequest = z.infer<typeof ContestRequestSchema>
export type ContestResponse = z.infer<typeof ContestResponseSchema> 
export type getAllContestsResponse = z.infer<typeof getAllContestsResponseSchema>
export type ContestCloseResponse = z.infer<typeof ContestCloseResponseSchema>
export type LeaderboardEntryResponse = z.infer<typeof LeaderboardEntryResponseSchema>

