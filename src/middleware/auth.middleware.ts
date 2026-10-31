import type {Context, Next} from 'hono'
import jwt from 'jsonwebtoken'
import { envConfig } from '@/config/env'
import { UnauthorizedError} from '@/shared/utils/error'
import { UserRole } from '@/db/types'

export type AuthUser = {
  userId: string
  email: string
  role: UserRole
}

export async function requireAuth(c: Context, next: Next) {
    const authHeader = c.req.header('Authorization')

    // 1️⃣ Header must exist
    if (!authHeader) {
        throw new UnauthorizedError('Authorization header missing')
    }

    // 2️⃣ Must be Bearer token
    if (!authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Invalid authorization format')
    }

    const token = authHeader.slice(7) // remove "Bearer "

    try {
        // 3️⃣ Verify + decode JWT
        const decoded = jwt.verify(
            token,
            envConfig.JWT_ACCESS_TOKEN_SECRET
        ) as AuthUser

        // 4️⃣ Attach user to request context
        c.set('user', decoded)

        await next()
    } catch {
        throw new UnauthorizedError('Invalid or expired token')
    }
}
