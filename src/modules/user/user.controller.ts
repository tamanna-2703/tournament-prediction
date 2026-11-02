import type { Handler } from "hono";  
import { createUserWithWallet } from "./user.service"; 

export const registerController: Handler = async (c) => {
  const {email, role} = await c.req.json()
  const trx = c.get('trx')

  const result = await createUserWithWallet(trx, email, role)

  return c.json(result)
} 
