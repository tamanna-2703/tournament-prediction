import {z} from '@hono/zod-openapi'
import { MatchResult } from '@/db/types'

const MatchResultEnum = z.enum([
  MatchResult.TEAM_A_WIN,
  MatchResult.TEAM_B_WIN,
  MatchResult.TIE,
  MatchResult.NO_RESULT
])

export const MatchRequestSchema = z.object({
  teamAId: z.string(),
  teamBId : z.string(),
  startTime : z.string().datetime(),
  endTime: z.string().datetime().optional(),
})

export const MatchResponseSchema = z.object({
    id: z.string(),
    contestId: z.string(),
    teamAId: z.string(),
    teamBId: z.string(),
    teamAName: z.string(),
    teamBName: z.string(),
    startTime: z.string(),
    endTime: z.string().nullable(),
    result: MatchResultEnum.nullable(),
})

export const MatchResultRequestSchema = z.object({
    result: MatchResultEnum,
})

export const PredictionRequestSchema = z.object({
    predictedResult: MatchResultEnum,
})

export const PredictionResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    matchId: z.string(),
    contestId: z.string(),
    predictedResult: MatchResultEnum,
    points: z.number(),
    createdAt: z.string(),
})

export const getAllMatchesResponseSchema = z.array(MatchResponseSchema)
export type MatchRequest = z.infer<typeof MatchRequestSchema>
export type MatchResponse = z.infer<typeof MatchResponseSchema>
export type getAllMatchesResponse = z.infer<typeof getAllMatchesResponseSchema>
export type MatchResultRequest = z.infer<typeof MatchResultRequestSchema>
export type PredictionRequest = z.infer<typeof PredictionRequestSchema>
export type PredictionResponse = z.infer<typeof PredictionResponseSchema>

