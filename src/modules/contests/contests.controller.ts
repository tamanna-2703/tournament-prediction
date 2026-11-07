import {Context, Handler } from "hono"
import { z } from "zod"
import { getAllContests, getContestsByTournamentId, getLeaderboardByContestId, createContest, joinContest } from "./contests.service"
import { ContestResponseSchema, LeaderboardEntryResponseSchema, getAllContestsResponseSchema } from "./contests.types"
import { BadRequestError } from "@/shared/utils/error"
import { closeContestByContestId } from "./contests.service"


export const getContestsController: Handler = async (c: Context) => {
  const contests = await getAllContests()
  const parsed = getAllContestsResponseSchema.parse(contests)
  return c.json(parsed)
}

export const getContestsByTournamentIdController: Handler = async (c: Context) => {
  const tournamentId = c.req.param('tournamentId')

  if (!tournamentId) {
    throw new BadRequestError('Tournament ID is required')
  }

  const contests = await getContestsByTournamentId(tournamentId)
  const parsed = getAllContestsResponseSchema.parse(contests)
  return c.json(parsed)
}

export const getLeaderboardByContestIdController: Handler = async (c: Context) => {
  const contestId = c.req.param('id')

  if (!contestId) {
    throw new BadRequestError('Contest ID is required')
  }

  const entries = await getLeaderboardByContestId(contestId)
  const parsed = z.array(LeaderboardEntryResponseSchema).parse(entries)
  return c.json({
    message: 'Leaderboard retrieved successfully',
    leaderboard: parsed,
  })
}

export const createContestController: Handler = async (c: Context) => {
  const trx = c.get ('trx')
  const tournamentId = c.req.param('tournamentId')

  const {startTime, endTime} = await c.req.json()

  if (!tournamentId) {
    throw new BadRequestError('Tournament ID is required')
  }

  if (!startTime){
    throw new BadRequestError('Start time is required')
  }

  if (!endTime){
    throw new BadRequestError('End time is required')
  }

  const startTimeDate = new Date(startTime)
  const endTimeDate = new Date(endTime)

  if (isNaN(startTimeDate.getTime())) {
    throw new BadRequestError('Invalid start time format')
  }

  if (isNaN(endTimeDate.getTime())) {
    throw new BadRequestError('Invalid end time format')
  }

  const contest = await createContest(trx, tournamentId, startTimeDate, endTimeDate)
  return c.json(contest, 201)
}

export const joinContestController: Handler = async (c: Context) => {
  const trx = c.get('trx')
  const contestId = c.req.param('id')
  const user = c.get('user')

  if (!contestId) {
    throw new BadRequestError('Contest ID is required')
  }

  if (!user) {
    throw new BadRequestError('User is not authenticated')
  }

  const contest = await joinContest(trx, contestId, user.userId)
  return c.json({
    message: 'Successfully joined the contest',
    contest: contest,
  })
}

export const closeContestByContestIdController: Handler = async (c: Context) => {
  const trx = c.get('trx')
  const contestId = c.req.param('id')

  if (!contestId) {
    throw new BadRequestError('Contest ID is required')
  }   

  const contest = await closeContestByContestId(trx, contestId)
  const parsed = ContestResponseSchema.parse(contest)
  return c.json({
    message: 'Contest closed successfully',
    contest: parsed,
  })
}

