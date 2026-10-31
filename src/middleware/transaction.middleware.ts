import type { Context, Next } from 'hono'
import { db } from '@/db/kysely'

export async function withTransaction(c: Context, next: Next) {
    return await db.transaction().execute(async (trx) => {
        // Attach transaction to request context
        c.set('trx', trx)

        // Continue request lifecycle
        return await next()
    })
}
