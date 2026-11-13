import {db} from '@/db/kysely'
import {Transaction, sql} from 'kysely'
import {DB, MatchResult, ContestStatus, TransactionReason} from '@/db/types'
import { ConflictError, NotFoundError } from '@/shared/utils/error'

export async function getAllMatches()
{
  const matches = await db
  .selectFrom('Match')
  .innerJoin('Contest', 'Match.contestId', 'Contest.id')
  .innerJoin('Team as TeamA', 'Match.teamAId', 'TeamA.id')
  .innerJoin('Team as TeamB', 'Match.teamBId', 'TeamB.id')
  .select([
    'Match.id',
    'Match.contestId',
    'Match.teamAId',
    'Match.teamBId',
    'Match.startTime',
    'Match.endTime',
    'Match.result',
    'TeamA.name as teamAName',
    'TeamB.name as teamBName',
 ])
 .execute()

 return matches
}

export async function getMatchesByContestId(contestId: string){
  const matches = await db
  .selectFrom('Match')
  .innerJoin('Contest','Match.contestId', 'Contest.id')
  .innerJoin('Team as TeamA', 'Match.teamAId', 'TeamA.id')
  .innerJoin('Team as TeamB', 'Match.teamBId', 'TeamB.id' )
  .select([
    'Match.id',
    'Match.contestId',
    'Match.teamAId',
    'Match.teamBId',
    'Match.startTime',
    'Match.endTime',
    'Match.result',
    'TeamA.name as teamAName',
    'TeamB.name as teamBName',
  ])
  .where('Match.contestId','=', contestId)
  .execute()

  return matches
}

export async function createMatch(
  trx: Transaction<DB>,
  contestId: string,
  teamAId: string,
  teamBId: string,
  startTime: Date,
  endTime: Date | null
){
  const contest = await trx 
  .selectFrom('Contest')
  .select(['id', 'endTime'])
  .where ('id', '=', contestId)
  .executeTakeFirst()

  if(!contest){
    throw new NotFoundError('Contest not found')
  }
   if (teamAId === teamBId){
    throw new ConflictError('Team A and Team B cannot be the same')
   }

   if( startTime< contest.endTime){
    throw new ConflictError('Match must start after contest end time')
   }

   if (startTime<= new Date()){
    throw new ConflictError('Start time must be in the future')
   }

   if(endTime && startTime>= endTime){
    throw new ConflictError('Start time must be before end time')
   }

   const [teamA, teamB] = await Promise.all([
    trx.selectFrom('Team').select('name').where('id','=', teamAId).executeTakeFirst(),

    trx.selectFrom('Team').select('name').
    where('id', '=', teamBId).executeTakeFirst(),
   ])

   if (!teamA) throw new NotFoundError('Team A not found')
   if(!teamB) throw new NotFoundError('Team B not found')

    const match = await trx
    .insertInto('Match')
    .values({
      id: sql`gen_random_uuid()`,
      contestId,
      teamAId,
      teamBId,
      startTime,
      endTime: endTime || null,
      result: null,
    })
    .returning([
      'id',
      'contestId',
      'teamAId',
      'teamBId',
      'startTime',
      'endTime',
      'result'
    ])
    .executeTakeFirstOrThrow()

    return{
      id: match.id,
      contestId: match.contestId,
      teamAId: match.teamAId,
      teamBId: match.teamBId,
      teamAName: teamA.name,
      teamBName: teamB.name,
      startTime: match.startTime instanceof Date ? match.startTime.toISOString(): match.startTime,
      endTime: match.endTime instanceof Date? match.endTime.toISOString():(match.endTime ||null), 
      result: match.result,
    }
}

export async function declareMatchResult(
  trx: Transaction<DB>,
  matchId: string,
  result: MatchResult
){
  const match = await trx
  .selectFrom('Match')
  .select(['id', 'teamAId', 'teamBId'])
  .where('id', '=', matchId)
  .executeTakeFirst()

  if(!match){
    throw new NotFoundError('Match not found')
  }

  const updatedMatch =await trx
  .updateTable('Match')
  .set({result})
  .where('id', '=', matchId)

  .returning([
    'id',
    'contestId',
    'teamAId',
    'teamBId',
    'startTime',
    'endTime',
    'result',
  ])
  .executeTakeFirstOrThrow()

  const [teamA, teamB] = await Promise.all([
trx.selectFrom('Team').select('name').where('id','=', updatedMatch.teamAId).executeTakeFirstOrThrow(),

trx.selectFrom('Team').select('name').where('id', '=', updatedMatch.teamBId).executeTakeFirstOrThrow(),
  ])

  return{
    id:updatedMatch.id,
    contestId: updatedMatch.contestId,
    teamAId: updatedMatch.teamAId,
    teamBId: updatedMatch.teamBId,
    teamAName: teamA.name,
    teamBName: teamB.name,
    startTime: updatedMatch.startTime instanceof Date ? updatedMatch.startTime.toISOString() : updatedMatch.startTime, 
    endTime: updatedMatch.endTime instanceof Date? updatedMatch.endTime.toISOString(): (updatedMatch.endTime || null),
    result: updatedMatch.result,
  }
}

export async function createPrediction(
  trx: Transaction<DB>,
  matchId: string,
  userId: string,
  predictedResult: MatchResult
) {

  //fetch match with contest info
   const match = await trx
        .selectFrom('Match')
        .innerJoin('Contest', 'Match.contestId', 'Contest.id')
        .select([
            'Match.id',
            'Match.contestId',
            'Match.startTime',
            'Match.result',
            'Contest.status as contestStatus',
            'Contest.endTime as contestEndTime',
        ])
        .where('Match.id', '=', matchId)
        .executeTakeFirst()

    if (!match) {
        throw new NotFoundError('Match not found')
    }

    // 2️⃣ Validate contest status
    if (
        match.contestStatus === ContestStatus.LOCKED ||
        match.contestStatus === ContestStatus.COMPLETED
    ) {
        throw new ConflictError('Contest is locked or completed')
    }

    if (match.contestEndTime <= new Date()) {
        throw new ConflictError('Contest has ended')
    }

    // 3️⃣ Validate match status
    if (match.result !== null) {
        throw new ConflictError('Match result already declared')
    }

    if (match.startTime <= new Date()) {
        throw new ConflictError('Match has already started')
    }

    // 4️⃣ Check if user has joined the contest (has at least one prediction in this contest)
    // 4️⃣ Check if user joined contest via wallet transaction
    const entryTransaction = await trx
        .selectFrom('WalletTransaction')
        .select('id')
        .where('userId', '=', userId)
        .where('reason', '=', TransactionReason.CONTEST_ENTRY)
        .where('referenceId', '=', match.contestId)
        .executeTakeFirst()

    if (!entryTransaction) {
        throw new ConflictError('User must join the contest before making predictions')
    }


    // 5️⃣ Check if prediction already exists for this match
    const existingPrediction = await trx
        .selectFrom('Prediction')
        .select('id')
        .where('matchId', '=', matchId)
        .where('userId', '=', userId)
        .executeTakeFirst()

    if (existingPrediction) {
        throw new ConflictError('Prediction already exists for this match')
    }

    // 6️⃣ Create prediction
    const prediction = await trx
        .insertInto('Prediction')
        .values({
            id: sql`gen_random_uuid()`,
            userId,
            matchId,
            contestId: match.contestId,
            predictedResult,
            points: 0,
        })
        .returning([
            'id',
            'userId',
            'matchId',
            'contestId',
            'predictedResult',
            'points',
            'createdAt',
        ])
        .executeTakeFirstOrThrow()

    return {
        ...prediction,
        createdAt: prediction.createdAt instanceof Date
            ? prediction.createdAt.toISOString()
            : prediction.createdAt,
    }
}



