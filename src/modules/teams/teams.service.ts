import { db } from "@/db/kysely"
import { Transaction, sql } from "kysely"
import { DB } from "@/db/types"
import { ConflictError, NotFoundError } from "@/shared/utils/error"

export async function getAllTeams() {
    const teams = await db
        .selectFrom('Team')
        .innerJoin('Sport', 'Team.sportId', 'Sport.id')
        .select(['Team.name', 'Sport.name as sportName'])
        .execute()

    return teams
}

export async function getTeamsBySportId(sportId: string) {
    const teams = await db
        .selectFrom('Team')
        .innerJoin('Sport', 'Team.sportId', 'Sport.id')
        .select(['Team.name', 'Sport.name as sportName'])
        .where('Team.sportId', '=', sportId)
        .execute()

    return teams
}

export async function createTeam(trx: Transaction<DB>, sportId: string, teamName: string) {
    const sport = await trx.selectFrom('Sport').selectAll().where('id', '=', sportId).executeTakeFirst()

    if (!sport) {
        throw new NotFoundError('Sport with this id not found')
    }

    const existingTeam = await trx
        .selectFrom('Team')
        .select('id')
        .where('name', '=', teamName)
        .where('sportId', '=', sportId)
        .executeTakeFirst()

    if (existingTeam) {
        throw new ConflictError('Team already exists for this sport')
    }

    await trx.insertInto('Team').values({
        id: sql`gen_random_uuid()`,
        name: teamName,
        sportId: sportId,
    }).execute()

    return {
        name: teamName,
        sportName: sport.name,
    }
}