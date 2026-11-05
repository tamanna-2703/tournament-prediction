import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import * as SportsController from './sports.controller'
import { withTransaction } from '@/middleware/transaction.middleware'
import { requireAuth } from '@/middleware/auth.middleware'
import { requireRole } from '@/middleware/role.middleware'
import { SportRequestSchema, SportResponseSchema, getAllSportsResponseSchema } from './sports.types'

const sportsRoutes = new OpenAPIHono()
const adminSportsRoutes = new OpenAPIHono()

sportsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Sports'],
        description: 'Retrieve a list of all available sports. Returns sport details including names, descriptions, and associated teams and tournaments.',
        security: [{ bearerAuth: [] }],
        middleware: [requireAuth],
        responses: {
            200: {
                description: 'Sports retrieved successfully',
                content: {
                    'application/json': {
                        schema: getAllSportsResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid request query',
                content: {
                    'application/json': {
                        schema: z.object({
                            error: z.string(),
                        }),
                    },
                },
            },
            404: {
                description: 'Sports not found',
                content: {
                    'application/json': {
                        schema: z.object({ error: z.string() }),
                    },
                },
            },
            500: {
                description: 'Internal server error',
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
    SportsController.getSportsController
)

adminSportsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/',
        tags: ['Sports'],
        description: 'Create a new sport category. Requires admin privileges. The sport can then be used to organize teams, tournaments, and contests.',
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: SportRequestSchema,
                    },
                },
            },
        },
        middleware: [requireAuth, requireRole('ADMIN'), withTransaction],
        responses: {
            200: {
                description: 'Sport created successfully',
                content: {
                    'application/json': {
                        schema: z.object({
                            message: z.string(),
                        }),
                    },
                },
            },
            400: {
                description: 'Invalid request query',
                content: {
                    'application/json': {
                        schema: z.object({
                            error: z.string(),
                        }),
                    },
                },
            },
            404: {
                description: 'Sport not found',
                content: {
                    'application/json': {
                        schema: z.object({ error: z.string() }),
                    },
                },
            },
            500: {
                description: 'Internal server error',
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
    SportsController.createSportController
)

export { sportsRoutes, adminSportsRoutes }