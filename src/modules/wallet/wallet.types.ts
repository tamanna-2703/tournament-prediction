import {z} from 'zod'
import { TransactionReason, TransactionType } from '@/db/types'
import { ref } from 'node:process'

export const WalletBalanceResponseSchema = z.object({
    balance: z.number(),
})

export const WalletTransactionResponseSchema = z.object({
    amount: z.number(),
    type: z.enum(TransactionType),
    reason: z.enum(TransactionReason),
    referenceId: z.string().nullable(),
    createdAt: z.string().datetime(),
})

export type WalletBalanceResponse = z.infer<typeof WalletBalanceResponseSchema>
export type WalletTransactionResponse = z.infer<typeof WalletTransactionResponseSchema>