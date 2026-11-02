import type {Transaction} from 'kysely'
import { z } from 'zod'
import {DB} from '@/db/types'
import {sql} from 'kysely'
import { WalletTransactionResponseSchema} from './wallet.types'
import {TransactionReason, TransactionType} from '@/db/types'
import {db} from '@/db/kysely'
import { NotFoundError } from '@/shared/utils/error'

export async function getWalletBalance (userId: string) {
  const balance = await db.selectFrom('Wallet')
    .select('balance')
    .where('userId', '=', userId)
    .executeTakeFirst()

    if (!balance) 
        throw new NotFoundError('Wallet not found for user')    
     return balance
} 

export async function getWalletTransactions (userId: string) {
  const result = await db.selectFrom('WalletTransaction')
    .selectAll()
    .where('userId', '=', userId)
    .execute()
  
  if (!result)
    throw new NotFoundError('No transactions found for user')

  
// ✅ Fix: Convert Dates to strings
 const transactions = result.map(t => ({
  ...t,
  createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt) 
}))

  return z.array(WalletTransactionResponseSchema).parse(transactions)
}

export async function updateWalletBalance(
  trx: Transaction<DB>,
  userId: string,
  amount: number,
  type: TransactionType,
  reason: TransactionReason,){
    const balance = await trx.selectFrom('Wallet')
    .selectAll()
    .where('userId', '=', userId)
    .executeTakeFirst()

if (!balance)
    throw new NotFoundError('Wallet not found')

const updatedBalance = balance.balance + amount

await trx.updateTable('Wallet')
.set({balance : updatedBalance} ). where('userId', '=', userId).execute()

await trx.insertInto('WalletTransaction')
.values({
  id: sql`gen_random_uuid()`,
  userId,
  walletId: balance.id,
  amount ,
  type,
  reason,
  referenceId: null,
}).execute()

return {
    oldBalance: balance.balance,
    newBalance: updatedBalance,
    transaction: {
      amount,
      type,
      reason,
      referenceId : null,
      createdAt: new Date(),
    },
  }
  }
