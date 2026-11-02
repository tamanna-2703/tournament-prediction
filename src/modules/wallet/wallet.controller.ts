import type { Context, Handler } from "hono";
import { getWalletBalance, getWalletTransactions } from "./wallet.service";
import {BadRequestError} from '@/shared/utils/error'

export const getWalletBalanceController: Handler = async (c: Context) => {
    const userId = c.get('user')?.userId

    if (!userId)
        throw new BadRequestError('User Not Found')

    const balance = await getWalletBalance(userId)

    return c.json(balance)
}

export const getWalletTransactionsController: Handler = async (c: Context) => {
    const userId = c.get('user')?.userId

    if (!userId)
        throw new BadRequestError('User Not Found')

    const transactions = await getWalletTransactions(userId)

    return c.json(transactions)
}
