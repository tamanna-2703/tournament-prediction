import type {Transaction} from 'kysely'
import type {DB} from '@/db/types'
import {sql} from 'kysely'
import { db} from '@/db/kysely'
import {ConflictError} from '@/shared/utils/error'

export async function getAllSports(){
  const sports = await db.selectFrom('Sport')
    .selectAll()
    .execute()
  return sports 
}

export async function createSport (trx: Transaction<DB>, name: string) {
  // 🔒 Check for duplicate sport name
  const existingSport = await trx.selectFrom('Sport')
    .select('id')
    .where('name', '=', name)
    .executeTakeFirst()

    if (existingSport) {
        throw new ConflictError('Sport with this name already exists')
    } 

    await trx.insertInto('Sport').values({ id: sql`gen_random_uuid()`, name }).execute()
    // Fetch all sports after insertion and return as array of strings
    const allSports = await trx.selectFrom('Sport').selectAll().execute()
    return allSports
}