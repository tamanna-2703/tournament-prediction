import {db} from '@/db/kysely'
import { Transaction, sql } from 'kysely'
import {DB } from '@/db/types'
import {ConflictError, NotFoundError} from '@/shared/utils/error'

export async function getAllTournaments(){
  const tournaments = await db.selectFrom('Tournament')
    .innerJoin('Sport', 'Tournament.sportId', 'Sport.id')
    .select(['Tournament.name', 'Tournament.entryFee', 'Sport.name as sportName'])
    .execute()

  return tournaments
}

export async function getTournamentsBySportId(sportId:string) {
  const tournaments = await db.selectFrom('Tournament')
  .innerJoin('Sport', 'Tournament.sportId', 'Sport.id')
  .select(['Tournament.name', 'Tournament.entryFee', 'Sport.name as sportName'])
  .where('Tournament.sportId', '=', sportId)
  .execute()

  return tournaments
}

export async function createTournament(trx: Transaction<DB>,
  sportId: string,
  tournamentName: string,
  entryFee: number
) { const sport = await trx.selectFrom('Sport')
  .selectAll()
  .where('id', '=', sportId)
  .executeTakeFirst()

  if (!sport) {
    throw new NotFoundError('Sport not found')
  }

  const existingTournament = await trx.selectFrom('Tournament')
  .select('id')
  .where('name', '=', tournamentName)
  .where('sportId', '=', sportId)
  .executeTakeFirst()

  if (existingTournament) {
    throw new ConflictError('Tournament with the same name already exists for this sport')
  }

  await trx.insertInto('Tournament')
  .values({
    id: sql`gen_random_uuid()`,
    name: tournamentName,
    sportId: sportId,
    entryFee: entryFee
  })
  .execute()

  return{
    name: tournamentName,
    entryFee: entryFee,
    sportName: sport.name,
  }
}
