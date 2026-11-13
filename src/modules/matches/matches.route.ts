import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {z} from 'zod'
import * as MatchesController from './matches.controller'
import { withTransaction } from "@/middleware/transaction.middleware";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireRole } from "@/middleware/role.middleware";
import { MatchRequestSchema, MatchResponseSchema, getAllMatchesResponseSchema, MatchResultRequestSchema, PredictionRequestSchema, PredictionResponseSchema } from "./matches.types";

const matchesRoutes = new OpenAPIHono()
const adminMatchesRoutes = new OpenAPIHono()

matchesRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Matches'],
    description: 'Retrieve a list of all matches across all contests. Returns match details including teams, schedules, and current status.',
        security: [{ bearerAuth: [] }],
        middleware: [requireAuth],
        responses: {
            200: {
                description: 'Matches retrieved successfully',
                content: {
                    'application/json': {
                        schema: getAllMatchesResponseSchema,
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
                description: 'Matches not found',
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
    MatchesController.getMatchesController
)

matchesRoutes.openapi(
    createRoute({
        method: 'get',
        path: '/{contestId}',
        tags: ['Matches'],
        description: 'Retrieve all matches associated with a specific contest. Requires a valid contest ID as a path parameter.',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                contestId: z.string(),
            }),
        },
        middleware: [requireAuth],
        responses: {
            200: {
                description: 'Matches retrieved successfully',
                content: {
                    'application/json': {
                        schema: getAllMatchesResponseSchema,
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
                description: 'Matches not found',
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
    MatchesController.getMatchesByContestIdController
)

adminMatchesRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{contestId}',
        tags: ['Matches'],
        description: 'Create a new match within a contest. Requires admin privileges. The match will be associated with the specified contest and teams.',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                contestId: z.string(),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: MatchRequestSchema,
                    },
                },
            },
        },
        middleware: [requireAuth, requireRole('ADMIN'), withTransaction],
        responses: {
            200: {
                description: 'Match created successfully',
                content: {
                    'application/json': {
                        schema: MatchResponseSchema,
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
                description: 'Contest or Team not found',
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
    MatchesController.createMatchController
)

adminMatchesRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/result',
        tags: ['Matches'],
        description: 'Declare the final result of a match. Requires admin privileges. Updates the match status and triggers any associated contest calculations.',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string(),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: MatchResultRequestSchema,
                    },
                },
            },
        },
        middleware: [requireAuth, requireRole('ADMIN'), withTransaction],
        responses: {
            200: {
                description: 'Match result declared successfully',
                content: {
                    'application/json': {
                        schema: MatchResponseSchema,
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
                description: 'Match not found',
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
    MatchesController.declareMatchResultController
)

matchesRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/{id}/predict',
        tags: ['Matches'],
        description: 'Create a prediction for a match. Requires authentication and the user must have joined the contest. The match must not have started yet and must not have a result.',
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: z.string(),
            }),
            body: {
                content: {
                    'application/json': {
                        schema: PredictionRequestSchema,
                    },
                },
            },
        },
        middleware: [requireAuth, withTransaction],
        responses: {
            200: {
                description: 'Prediction created successfully',
                content: {
                    'application/json': {
                        schema: PredictionResponseSchema,
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
                description: 'Match or Contest not found',
                content: {
                    'application/json': {
                        schema: z.object({ error: z.string() }),
                    },
                },
            },
            409: {
                description: 'Prediction already exists or contest is locked',
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
    MatchesController.createPredictionController
)

export { matchesRoutes, adminMatchesRoutes }

