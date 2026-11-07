import {Context, Handler} from "hono"
import {getAllTournaments, getTournamentsBySportId, createTournament} from "./tournaments.service" 
import { BadRequestError } from "@/shared/utils/error"

export const getTournamentsController: Handler = async (c: Context) => {
   const tournaments = await getAllTournaments();
    return c.json(tournaments)
}
 export const getTournamentsBySportIdController: Handler = async (c: Context) => {
    const sportId = c.req.param("sportId");   

    if (!sportId) {
        throw new BadRequestError("Sport ID is required");
    }

    const tournaments = await getTournamentsBySportId(sportId);
    return c.json(tournaments);
}
export const createTournamentController: Handler = async (c: Context) => {
  const trx = c.get("trx");
  const sportId = c.req.param("sportId");
  const {name, entryFee} = await c.req.json();

  if (!sportId) {
    throw new BadRequestError("Sport ID is required");
  }

  if (!name){
    throw new BadRequestError("Tournament name is required");
  }

  if(!entryFee || typeof entryFee !== "number" || entryFee < 0){
    throw new BadRequestError("Valid entry fee is required");
  }
  const trimmedName = name.trim().toLowerCase();

  const tournament = await createTournament(trx, sportId, trimmedName, entryFee);
  return c.json(tournament);
}