import type { Handler } from 'hono'
import jwt from 'jsonwebtoken'
import { envConfig } from '@/config/env'
import { db } from '@/db/kysely'
import { NotFoundError } from '@/shared/utils/error'

export const generateTokenController: Handler = async (c) => {
  const { email } = await c.req.json();

  const user = await db
    .selectFrom('User')
    .select(['id', 'email', 'role'])
    .where('email', '=', email)
    .executeTakeFirst()

  if (!user) {
    throw new NotFoundError('User not found')
  }

  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, envConfig.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  })

  return c.json({ token })
}

