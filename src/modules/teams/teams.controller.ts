import { Context, Handler } from "hono"
import { getAllTeams, getTeamsBySportId, createTeam } from './teams.service'
import { BadRequestError } from "@/shared/utils/error";

export const getTeamsController: Handler = async (c: Context) => {
    const teams = await getAllTeams();
    return c.json(teams)
}

export const getTeamsBySportIdController: Handler = async (c: Context) => {
    const sportId = c.req.param('sportId')

    if (!sportId) {
        throw new BadRequestError('Sport ID is required')
    }

    const teams = await getTeamsBySportId(sportId);
    return c.json(teams)
}

export const createTeamController: Handler = async (c: Context) => {
    const trx = c.get('trx')
    const sportId = c.req.param('sportId')

       console.log('Sport ID:', sportId) // Debug log to check the sportId value

      const { name } = await c.req.json()

    if (!sportId) {
        throw new BadRequestError('Sport ID is required')
    }

    if (!name) {
        throw new BadRequestError('Team name is required')
    }

    const trimmedName = name.trim().toLowerCase()

    const team = await createTeam(trx, sportId, trimmedName)

    return c.json(team)
}

