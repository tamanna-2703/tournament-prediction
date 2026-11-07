import {db} from "@/db/kysely"
import {Transaction, sql} from "kysely"
import {DB, ContestStatus, MatchResult, TransactionType, TransactionReason} from "@/db/types"
import {ConflictError, NotFoundError} from "@/shared/utils/error"

const CORRECT_POINTS = 4
const WRONG_POINTS = 0
const TIE_POINTS = 2

//top 3 users get 50%, 30% and 20% of the prize pool respectively
const PRIZE_SPLIT = [0.5, 0.3, 0.2]

export async function getAllContests() {
  const contests = await db
  .selectFrom('Contest')
  .innerJoin('Tournament', 'Contest.tournamentId', 'Tournament.id')
    .select([
      'Contest.id',
      'Contest.tournamentId',
      'Contest.startTime',
      'Contest.endTime',
      'Contest.status',
      'Contest.prizePool',
      'Contest.createdAt',
      'Tournament.name as tournamentName'
    ])
    .execute()

  return contests.map(c => ({
    ...c,
    startTime: c.startTime instanceof Date ? c.startTime.toISOString() : String(c.startTime),
    endTime: c.endTime instanceof Date ? c.endTime.toISOString() : String(c.endTime),
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  }))
}

export async function getLeaderboardByContestId(contestId: string) {
  return await db
    .selectFrom('LeaderboardEntry')
    .innerJoin('User', 'LeaderboardEntry.userId', 'User.id')
    .select([
      'LeaderboardEntry.id',
      'LeaderboardEntry.contestId',
      'LeaderboardEntry.userId',
      'User.email as userEmail',
      'LeaderboardEntry.score',
      'LeaderboardEntry.rank',
      'LeaderboardEntry.prize',
      'LeaderboardEntry.createdAt'
    ])
    .where('LeaderboardEntry.contestId', '=', contestId)
    .orderBy('LeaderboardEntry.rank', 'asc')
    .execute()
}


export async function getContestsByTournamentId(tournamentId: string) {
  const contests = await db
    .selectFrom('Contest')
    .innerJoin('Tournament', 'Contest.tournamentId', 'Tournament.id')
    .select([
      'Contest.id',
      'Contest.tournamentId',
      'Contest.startTime',
      'Contest.endTime',
      'Contest.status',
      'Contest.prizePool',
      'Contest.createdAt',
      'Tournament.name as tournamentName'
    ])
    .where('Contest.tournamentId', '=', tournamentId)
    .execute()

  return contests.map(c => ({
    ...c,
    startTime: c.startTime instanceof Date ? c.startTime.toISOString() : String(c.startTime),
    endTime: c.endTime instanceof Date ? c.endTime.toISOString() : String(c.endTime),
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  }))
}

export async function createContest(
  trx: Transaction<DB>,
   tournamentId: string,
    startTime: Date, 
    endTime: Date
  ) {
  const tournament = await trx
    .selectFrom('Tournament')
    .select(['id', 'name'])
    .where('id', '=', tournamentId)
    .executeTakeFirst()
  
  if (!tournament) {
    throw new NotFoundError('Tournament not found') 

  }

  if (startTime >= endTime) {
    throw new ConflictError('Start time must be before end time')
  }

  if (startTime <= new Date()) {
    throw new ConflictError('Start time must be in the future')
  }

  const contest = await trx
    .insertInto('Contest')
    .values({
      id: sql`gen_random_uuid()`,
      tournamentId,
      startTime,
      endTime,
      prizePool: 0,
      status: ContestStatus.UPCOMING,
    })
    .returning([
      'id',
      'tournamentId',
      'startTime',  
      'endTime',
      'status',
      'prizePool',
      'createdAt'
    ])
    .executeTakeFirstOrThrow()

  return {
    ...contest,
    tournamentName: tournament.name,
    startTime: contest.startTime instanceof Date ? contest.startTime.toISOString() : String(contest.startTime),
    endTime: contest.endTime instanceof Date ? contest.endTime.toISOString() : String(contest.endTime),
    createdAt: contest.createdAt instanceof Date ? contest.createdAt.toISOString() : String(contest.createdAt),
  }
}

export async function joinContest(
  trx: Transaction<DB>,
  contestId: string,
  userId: string
) {
  // fetch contest details+ tournament entry fee
  const contest = await trx
    .selectFrom('Contest')
    .innerJoin('Tournament', 'Contest.tournamentId', 'Tournament.id')
    .select([
      'Contest.id',
      'Contest.status',
      'Contest.endTime',
      'Contest.prizePool',
      'Tournament.entryFee'
    ])
    .where('Contest.id', '=', contestId)
    .executeTakeFirst()

  if (!contest) {
    throw new NotFoundError('Contest not found')
  }

  if (
    contest.status === ContestStatus.LOCKED ||
    contest.status === ContestStatus.COMPLETED ||
    contest.endTime <= new Date()
  ) {
    throw new ConflictError('Contest is not open for joining')
  }
   
  //Prevent duplicate entries
  const existingEntry = await trx
    .selectFrom('WalletTransaction')
    .select('id')
    .where('userId', '=', userId)
    .where('reason', '=', TransactionReason.CONTEST_ENTRY)
    .where('referenceId', '=', contestId)
    .executeTakeFirst()

    if (existingEntry) {
      throw new ConflictError('User has already joined this contest')
    }

    //fetch wallet
    const wallet = await trx
    .selectFrom('Wallet')
    .select(['id', 'balance'])
    .where('userId', '=', userId)
    .executeTakeFirst()

    if (!wallet) {
      throw new NotFoundError('Wallet not found for user')
    }
      if (wallet.balance < contest.entryFee) {
        throw new ConflictError('Insufficient balance to join contest')
      }

      //Deduct entry fee from wallet
      await trx
      .updateTable('Wallet')
      .set({
        balance : wallet.balance - contest.entryFee,
      })
      .where('id', '=', wallet.id)
      .execute()
    
      //Wallet transaction (DEBIT)
      await trx
      .insertInto('WalletTransaction')
      .values({
        id: sql`gen_random_uuid()`,
        userId,
        walletId: wallet.id,
        amount: contest.entryFee,
        type: TransactionType.DEBIT,
        reason: TransactionReason.CONTEST_ENTRY,
        referenceId: contestId,
      })
      .execute()

      //Increase contest prize pool 
      await trx
      .updateTable('Contest')
      .set({
        prizePool: contest.prizePool + contest.entryFee,
      })
      .where('id', '=', contestId)
      .execute()

      const fullContest = await trx
        .selectFrom('Contest')
        .innerJoin('Tournament', 'Contest.tournamentId', 'Tournament.id')
        .select([
          'Contest.id',
          'Contest.tournamentId',
          'Contest.startTime',
          'Contest.endTime',
          'Contest.status',
          'Contest.prizePool',
          'Contest.createdAt',
          'Tournament.name as tournamentName',
        ])
        .where('Contest.id', '=', contestId)
        .executeTakeFirstOrThrow()

      return {
        ...fullContest,
        startTime: fullContest.startTime instanceof Date ? fullContest.startTime.toISOString() : String(fullContest.startTime),
        endTime: fullContest.endTime instanceof Date ? fullContest.endTime.toISOString() : String(fullContest.endTime),
        createdAt: fullContest.createdAt instanceof Date ? fullContest.createdAt.toISOString() : String(fullContest.createdAt),
      }
    }


    export async function closeContestByContestId(
      trx: Transaction<DB>,
      contestId: string
    ) {
    
      // ======= 1. VAlidate contest exists and can be closed =======
      const contest = await trx
      .selectFrom('Contest')
      .select(['id', 'status','endTime', 'prizePool'])
      .where('id', '=', contestId)
      .executeTakeFirst()

      if (!contest) {
        throw new NotFoundError('Contest not found')
      }

      if (contest.status === ContestStatus.COMPLETED) {
        throw new ConflictError('Contest is already completed')
      }

      if(contest.status !== ContestStatus.LOCKED){
        throw new ConflictError('Contest cannot be closed before it is locked')
      }

      if (contest.endTime > new Date()) {
        throw new ConflictError('Contest cannot be closed before end time')
      }

// =======2. FETCH ND VALIDATE MATCHES========

  const matches = await trx
  .selectFrom('Match')
  .select(['id', 'result'])
  .where('contestId', '=', contestId)
  .execute()

  if (matches.length === 0) {
    throw new ConflictError('No matches found for this contest')
  } 

  if (matches.some(match => match.result === null)) {
    throw new ConflictError('All matches must have results before closing the contest')
   }


// ========FETCH PREDICTIONS WITH MATCH RESULT ======   


  const predictions = await trx
  .selectFrom('Prediction')
  .innerJoin('Match', 'Prediction.matchId', 'Match.id')
  .select([
    'Prediction.id',
    'Prediction.userId',
    'Prediction.predictedResult',
    'Match.result as actualResult'
  ])
  .where('Prediction.contestId', '=', contestId)
  .execute()


  // =======3. STORIND LOGIC (PREDICTION --> POINTS)========

  const userScoreMap = new Map<string, number>()

  for (const p of predictions) {
    let points = WRONG_POINTS

    if (
      p.actualResult === MatchResult.TIE ||
      p.actualResult=== MatchResult.NO_RESULT
    ) {
      points = TIE_POINTS
    } else if (p.predictedResult === p.actualResult) {
      points = CORRECT_POINTS
    }

    //UPDATE PREDICTION WITH POINTS

    await trx
    .updateTable('Prediction')
    .set({ points })
    .where('id', '=', p.id)
    .execute()

    //Accumulate user scores
    userScoreMap.set(
      p.userId,
      (userScoreMap.get(p.userId) ?? 0) + points
    )
  
  }

// =====4. LEADERBOARD GENERATION========// 

   const leaderboard = Array.from(userScoreMap.entries())
    .map(([userId, score]) => ({ userId, score }))  

  //Sort by score desc
  .sort((a, b) => b.score - a.score)

  for (let i = 0; i < leaderboard.length; i++) {
    await trx
    .insertInto('LeaderboardEntry')
    .values({
      id: sql`gen_random_uuid()`,
      contestId,
      userId: leaderboard[i].userId,
      score: leaderboard[i].score,
      rank: i + 1,
      prize: 0,
    })
    .execute()
  }


// =======PRIZE DISTRIBUTION (WALLET + LEDGER)========

  const WinnerCount = Math.min(PRIZE_SPLIT.length, leaderboard.length)
  for (let i = 0; i < WinnerCount; i++) {
    const winner = leaderboard[i]
    const prize = Math.floor(contest.prizePool * PRIZE_SPLIT[i])
    
    if (prize <=0) continue

    //Update leaderboard with prize
    await trx
    .updateTable('LeaderboardEntry')
    .set({ prize })
    .where('contestId', '=', contestId)
    .where('userId', '=', winner.userId)
    .execute()

    //Credit prize to user wallet
    await trx
    .updateTable('Wallet')
    .set({
      balance: sql`balance + ${prize}`
    })
    .where('userId', '=', winner.userId)
    .execute()

   // fetch wallet id for transaction record

    const wallet = await trx
    .selectFrom('Wallet')
    .select('id')
    .where('userId', '=', winner.userId)
    .executeTakeFirst()

    //Ledger entryy 
    await trx
    .insertInto('WalletTransaction')
    .values({
      id: sql`gen_random_uuid()`,
      userId: winner.userId,
      walletId: wallet!.id,
      amount: prize,
      type: TransactionType.CREDIT,
      reason: TransactionReason.PRIZE_WIN,
    })
    .execute()
  }


  // =======5. finalize contest ========

  await trx
    .updateTable('Contest')
    .set({
      status: ContestStatus.COMPLETED,
    })
    .where('id', '=', contestId)
    .execute()

  const finalContest = await trx
    .selectFrom('Contest')
    .innerJoin('Tournament', 'Contest.tournamentId', 'Tournament.id')
    .select([
      'Contest.id',
      'Contest.tournamentId',
      'Contest.startTime',
      'Contest.endTime',
      'Contest.status',
      'Contest.prizePool',
      'Contest.createdAt',
      'Tournament.name as tournamentName'
    ])
    .where('Contest.id', '=', contestId)
    .executeTakeFirstOrThrow()

  return {
    ...finalContest,
    startTime: finalContest.startTime instanceof Date ? finalContest.startTime.toISOString() : String(finalContest.startTime),
    endTime: finalContest.endTime instanceof Date ? finalContest.endTime.toISOString() : String(finalContest.endTime),
    createdAt: finalContest.createdAt instanceof Date ? finalContest.createdAt.toISOString() : String(finalContest.createdAt),
  }
}