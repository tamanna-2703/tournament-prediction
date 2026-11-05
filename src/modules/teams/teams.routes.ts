import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import * as TeamsController from './teams.controller'
import { withTransaction } from '@/middleware/transaction.middleware'
import { requireAuth } from '@/middleware/auth.middleware'
import { requireRole } from '@/middleware/role.middleware'
import { TeamRequestSchema, TeamResponseSchema, getAllTeamsResponseSchema } from './teams.types'

const teamsRoutes = new OpenAPIHono()
const adminTeamsRoutes = new OpenAPIHono()

teamsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/',
        tags: ['Teams'],
        description: 'Retrieve a list of all teams across all sports. Returns team details including names, logos, and associated sport information.',
        security: [{ bearerAuth: [] }],
        middleware: [requireAuth],
        responses: {
            200: {
                description: 'Teams retrieved successfully',
                content: {
                    'application/json': {
                        schema: getAllTeamsResponseSchema,
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
                description: 'Teams not found',
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
    TeamsController.getTeamsController
)

teamsRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{sportId}',
        tags: ['Teams'],
        description: 'Retrieve all teams associated with a specific sport. Requires a valid sport ID as a path parameter.',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                sportId: z.string(),
            }),
        },
        middleware: [requireAuth],
        responses: {
            200: {
                description: 'Teams retrieved successfully',
                content: {
                    'application/json': {
                        schema: getAllTeamsResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid request',
                content: {
                    'application/json': {
                        schema: z.object({
                            error: z.string(),
                        }),
                    },
                },
            },
            404: {
                description: 'Teams not found',
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
    TeamsController.getTeamsBySportIdController
)

adminTeamsRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{sportId}',
        tags: ['Teams'],
        description: 'Create a new team within a sport. Requires admin privileges. The team will be associated with the specified sport and can be used in matches.',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                sportId: z.string(),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: TeamRequestSchema,
                    },
                },
            },
        },
        middleware: [requireAuth, requireRole('ADMIN'), withTransaction],
        responses: {
            200: {
                description: 'Team created successfully',
                content: {
                    'application/json': {
                        schema: TeamResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid request',
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
    TeamsController.createTeamController
)

export { teamsRoutes, adminTeamsRoutes }

