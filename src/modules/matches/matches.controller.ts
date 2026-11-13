import {Context, Handler} from "hono"
import { getAllMatches, getMatchesByContestId, createMatch, declareMatchResult, createPrediction } from "./matches.service"
import { BadRequestError } from "@/shared/utils/error"
import { getAllMatchesResponseSchema, MatchResponseSchema, PredictionResponseSchema } from "./matches.types"
import{MatchResult} from '@/db/types'

export const getMatchesController: Handler= async (c: Context)=>{
  const matches = await getAllMatches()
  const parsed = getAllMatchesResponseSchema.parse(matches)
  return c.json(parsed)
}

export const getMatchesByContestIdController: Handler = async (c: Context)=>{
  const contestId = c.req.param('contestId')

  if (!contestId){
    throw new BadRequestError('Contest ID is required')
  }

  const matches = await getMatchesByContestId(contestId)
  const parsed = getAllMatchesResponseSchema.parse(matches)
  return c.json(parsed)
}

export const createMatchController: Handler = async (c:Context) =>{
  const trx = c.get('trx')
  const contestId = c.req.param('contestId')
  const {teamAId, teamBId, startTime, endTime} = await c.req.json()

  if(!contestId){
    throw new BadRequestError('contest ID is required')
  }

  if(!teamAId){
    throw new BadRequestError('Team A ID is reuired')
  }

   if(!teamBId){
    throw new BadRequestError('Team B ID is reuired')
  }

  if(!startTime){
    throw new BadRequestError('Start Time is Required')
  }

  const startTimeDate = new Date(startTime)

  if (isNaN(startTimeDate.getTime())){
    throw new BadRequestError('Invalid start time format')
  }

  let endTimeDate: Date | null = null
   if (endTime) {
    endTimeDate = new Date(endTime)
    if(isNaN(endTimeDate.getTime())){
      throw new BadRequestError('Invalid end time format')
    }
   }

   const match = await createMatch(trx, contestId, teamAId, teamBId, startTimeDate, endTimeDate)
   const parsed = MatchResponseSchema.parse(match)
   return c.json(parsed)
}

export const declareMatchResultController: Handler = async (c: Context)=>{
  const trx = c.get('trx')
  const matchId = c.req.param('id')
  const {result} = await c.req.json()

  if(!matchId){
    throw new BadRequestError('Match ID is required')
  }

  if (!result){
    throw new BadRequestError('Result is required')
  }

  if (!Object.values(MatchResult).includes(result)){
    throw new BadRequestError('Invalid match Result')
  }

  const match = await declareMatchResult(trx, matchId, result)
  const parsed = MatchResponseSchema.parse(match)
  return c.json(parsed)
}

export const createPredictionController: Handler=  async (c:Context)=>{
  const trx = c.get('trx')
  const user = c.get('user')
  const matchId = c.req.param('id')
  const {predictedResult}= await c.req.json()

  if (!user?.userId){
    throw new BadRequestError('user not Authenticated')
  }

  if (!matchId) {
        throw new BadRequestError('Match ID is required')
    }

    if (!predictedResult) {
        throw new BadRequestError('Predicted result is required')
    }

    if (!Object.values(MatchResult).includes(predictedResult)) {
        throw new BadRequestError('Invalid predicted result')
    }

    const prediction = await createPrediction(trx, matchId, user.userId, predictedResult)
    const parsed = PredictionResponseSchema.parse(prediction)
    return c.json(parsed)

}