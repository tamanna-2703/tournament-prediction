import type { Context, Next } from 'hono'
import { ForbiddenError } from '@/shared/utils/error'
import type { UserRole } from '@/db/types'

export function requireRole(...allowedRoles: UserRole[]) {
    return async (c: Context, next: Next) => {
        const user = c.get('user')

        if (!user) {
            throw new ForbiddenError('Authentication required')
        }

        if (!allowedRoles.includes(user.role)) {
            throw new ForbiddenError('Insufficient permissions')
        }

        return next()
    }
}
