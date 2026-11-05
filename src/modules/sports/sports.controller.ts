import {Context, Handler} from 'hono'
import { getAllSports, createSport } from './sports.service'
import { BadRequestError } from '@/shared/utils/error'

export const getSportsController: Handler = async (c: Context) => {
  const sports = await getAllSports()
  return c.json(sports)
}

export const createSportController: Handler = async (c: Context) => {
  const trx = c.get('trx')
  const { name } = await c.req.json()

  if (!name){
    throw new BadRequestError('Sport name is required') 
  }
 //eg added Football but user type like football or FOOTBALL, so we trim and convert to lowercase to avoid duplicates with different cases or extra spaces
  const trimmedName = name.trim().toLowerCase()
await createSport(trx, trimmedName)
return c.json({ message: 'Sport added successfully' })

}