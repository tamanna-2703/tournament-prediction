import type { Transaction } from 'kysely'
import type { DB } from '@/db/types'
import { TransactionReason, TransactionType, UserRole } from '@/db/types'
import { sql } from 'kysely'
import { ConflictError } from '@/shared/utils/error'

const DEFAULT_WALLET_BALANCE = 100

export async function createUserWithWallet(
    trx: Transaction<DB>,
    email: string,
    role: UserRole
) {
    // 🔒 0️⃣ Check if user already exists
    const existingUser = await trx
        .selectFrom('User')
        .select(['id'])
        .where('email', '=', email)
        .executeTakeFirst()

    if (existingUser) {
        throw new ConflictError('User with this email already exists')
    }

    // 1️⃣ Insert user (explicit DB defaults)
    const user = await trx
        .insertInto('User')
        .values({
            id: sql`gen_random_uuid()`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
            email,
            role,
        })
        .returning(['id', 'email', 'role'])
        .executeTakeFirstOrThrow()

    // 2️⃣ Insert wallet
    const wallet = await trx
        .insertInto('Wallet')
        .values({
            id: sql`gen_random_uuid()`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
            userId: user.id,
            balance: DEFAULT_WALLET_BALANCE,
        })
        .returning(['id', 'balance'])
        .executeTakeFirstOrThrow()

    // 3️⃣ Ledger entry
    await trx
        .insertInto('WalletTransaction')
        .values({
            id: sql`gen_random_uuid()`,
            userId: user.id,
            walletId: wallet.id,
            amount: DEFAULT_WALLET_BALANCE,
            type: TransactionType.CREDIT,
            reason: TransactionReason.NEW_USER_BONUS,
        })
        .execute()

    return { user, wallet }
}
