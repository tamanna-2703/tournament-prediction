import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import * as WalletController from './wallet.controller'
import {
    WalletBalanceResponseSchema,
    WalletTransactionResponseSchema,
} from './wallet.types'
import { withTransaction } from '@/middleware/transaction.middleware'
import { requireAuth } from '@/middleware/auth.middleware'
import { requireRole } from '@/middleware/role.middleware'

const WalletRoutes=  new OpenAPIHono()
const adminWalletRoutes = new OpenAPIHono()

WalletRoutes.openapi(
  createRoute({
    method: 'get',
    path:'/',
    tags: ['Wallet'],
    description: 'Retrieve the current balance of the user\'s wallet.',
    security: [{ bearerAuth: [] }],
    middleware:[requireAuth],
    responses: {
      200: {
        description: 'Successful response with the wallet balance.',
        content:  {
          'application/json': {
            schema: WalletBalanceResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request - User Not Found or Invalid Request.',
        content: {
          'application/json': {
            schema: z.object({  
              error: z.string(),
            }),
          },
        },
      },404: {
        description: 'Not Found - Wallet not found for user.',
        content: {
          'application/json': {
            schema: z.object({  
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  WalletController.getWalletBalanceController
)

WalletRoutes.openapi(
  createRoute({
    method: 'get',
    path:'/transactions',
    tags: ['Wallet'],
    description: 'Retrieve the transaction history of the user\'s wallet.',
    security: [{ bearerAuth: [] }],
    middleware:[requireAuth],
    responses: {
      200: {
        description: 'Successful response with the list of wallet transactions.',
        content:  {
          'application/json': {
            schema: WalletTransactionResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request - User Not Found or Invalid Request.',
        content: {
          'application/json': {
            schema: z.object({  
              error: z.string(),
            }),
          },
        },
      },404: {
        description: 'Not Found - Wallet not found for user.',
        content: {
          'application/json': {
            schema: z.object({  
              error: z.string(),
            }),
          },
        },
      },500: {
        description: 'Internal Server Error - Database issues or unexpected errors.',
        content: {
          'application/json': {
            schema: z.object({  
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  WalletController.getWalletTransactionsController
)
export default WalletRoutes