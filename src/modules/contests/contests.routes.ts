import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {z} from "zod"
import * as ContestsController from "./contests.controller"
import { withTransaction } from "@/middleware/transaction.middleware";
import { requireAuth } from "@/middleware/auth.middleware";
import { requireRole } from "@/middleware/role.middleware";
import { ContestCloseResponseSchema, ContestRequestSchema, ContestResponseSchema, getAllContestsResponseSchema, LeaderboardEntryResponseSchema } from "./contests.types";

const contestsRoutes = new OpenAPIHono()
const adminContestsRoutes = new OpenAPIHono()

contestsRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Contests'],
    description: 'Retrieve a list of all contests across all tournaments.',
    security: [{ bearerAuth: [] }],
    middleware: [requireAuth],
    responses:{
      200: {
        description: 'A list of contests.',
        content: {
          'application/json': {
            schema: getAllContestsResponseSchema,
          },
        },
      },
      400:{
        description: 'Invalid request parameters.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
      }
    }
  },404:{
    description: 'Contestsnot found.',
    content: {
      'application/json': {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },500:{
    description: 'Internal server error.',
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

  ContestsController.getContestsController
)

contestsRoutes.openapi(
  createRoute({
    method: 'get',
    path :'/{tournamentId}',
    tags: ['Contests'],
    description: 'Retrieve a list of contests for a specific tournament.',
    security: [{ bearerAuth: [] }],
    request:{
      params: z.object({
        tournamentId: z.string(),
      }),
    },
    middleware: [requireAuth],
    responses:{
      200: {
        description: 'A list of contests for the specified tournament.',
        content: {
          'application/json': {
            schema: getAllContestsResponseSchema,
          },
        },
      },
      400:{
        description: 'Invalid request parameters.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
      }
    }
  },404:{
    description: 'Contests not found.',
    content: {
      'application/json': {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },500:{
    description: 'Internal server error.',
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
  ContestsController.getContestsByTournamentIdController
)

contestsRoutes.openapi(
  createRoute({
    method: 'get',
    path : '/{id}/leaderboard',
    tags: ['Contests'],
    description: 'Retrieve the leaderboard for a specific contest.',
    security: [{ bearerAuth: [] }],
    request:{
      params: z.object({
        id: z.string(),
      }), 
    },
    middleware: [requireAuth],
    responses:{
      200: {
        description: 'The leaderboard for the specified contest.',
        content: {
          'application/json': {
            schema : z.object({
              message: z.string(),
              leaderboard: z.array(LeaderboardEntryResponseSchema),
            }),
          },
        },
      },
      400:{
        description: 'Invalid request parameters.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
      },
    },
  },
  404:{
    description: 'Contest not found.',
    content: {
      'application/json': {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },
  500:{
    description: 'Internal server error.',
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
  ContestsController.getLeaderboardByContestIdController
)

contestsRoutes.openapi(
  createRoute({
    method: 'post',
    path: "/{id}/join",
    tags: ['Contests'],
    description: 'Join a specific contest.',
    security: [{ bearerAuth: [] }],
    request:{
      params: z.object({
        id: z.string(),
      }),
    },
    middleware: [requireAuth, withTransaction],
    responses:{
      200: {
        description: 'Successfully joined the contest.',
        content: {
          'application/json': {
            schema: z.object({
              message: z.string(),
              contest: ContestResponseSchema,
            }),
          },
        },
      },
      400:{
        description: 'Invalid request parameters.', 
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
      },
    },
  },
  404:{
    description: 'Contest not found.',
    content: {
      'application/json': {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },
  500:{
    description: 'Internal server error.',
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
  ContestsController.joinContestController
)

adminContestsRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/{tournamentId}',
    tags: ['Contests'],
    description: 'Create a new contest for a specific tournament.',
    security: [{ bearerAuth: [] }],
    request:{
      params: z.object({
        tournamentId: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: ContestRequestSchema,
          },
        },
      },
    },
    middleware: [requireAuth, requireRole('ADMIN'), withTransaction],
    responses:{
      201: {
        description: 'Successfully created the contest.',
        content: {
          'application/json': {
            schema: ContestResponseSchema,
          },
        },
      },
      400:{
        description: 'Invalid request parameters.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      404:{
        description: 'Tournament not found.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500:{
        description: 'Internal server error.',
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
  ContestsController.createContestController
)

adminContestsRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/{id}/close',
    tags: ['Contests'],
    description: 'Close a specific contest.',
    security: [{ bearerAuth: [] }],
    request:{
      params: z.object({
        id: z.string(),
      }),
    },
    middleware: [requireAuth, requireRole('ADMIN'), withTransaction],
    responses:{
      200: {
        description: 'Successfully closed the contest.',
        content: {
          'application/json': {
            schema: ContestCloseResponseSchema,
          },
        },
      },
      400:{
        description: 'Invalid request parameters.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      404:{
        description: 'Contest not found.',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      500:{
        description: 'Internal server error.',
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
  ContestsController.closeContestByContestIdController
)

export {contestsRoutes, adminContestsRoutes}

 

