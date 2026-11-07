import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import {z} from "zod"
import * as TournamentsController from "./tournaments.controller"
import { TournamentRequestSchema, TournamentResponseSchema, getAllTournamentsResponseSchema } from './tournaments.types'
import { requireAuth } from '@/middleware/auth.middleware'
import { requireRole } from '@/middleware/role.middleware'
import { withTransaction } from '@/middleware/transaction.middleware'

const tournamentsRoute = new OpenAPIHono();
const adminTournamentsRoute = new OpenAPIHono();

tournamentsRoute.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Tournaments"],
    description: "Get all tournaments",
    security: [{ bearerAuth: [] }],
    middleware: [requireAuth],
    responses:{
      200: {description: "List of tournaments",
      content: {
        "application/json": {
          schema: getAllTournamentsResponseSchema
        },
      },
    }, 
    400: {description: "Bad Request",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    404:{
      description: "Tournament Not Found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },500:{
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
  }),
  TournamentsController.getTournamentsController
)

tournamentsRoute.openapi(
  createRoute({
    method: "get",
    path : '/{sportId}',
    tags: ["Tournaments"],
    description: "Get tournaments by sport ID",
    security: [{ bearerAuth: [] }],
    request:{
      params: z.object({
        sportId: z.string(),
      }),
    },
    middleware: [requireAuth],
    responses:{
      200: {description: "List of tournaments for the specified sport",
      content: {  
        "application/json": {
          schema: getAllTournamentsResponseSchema
        },
      },
    }, 
    400: {description: "Bad Request",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
    404:{
      description: "Tournament Not Found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },500:{
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
  }),
  TournamentsController.getTournamentsBySportIdController
)

adminTournamentsRoute.openapi(
  createRoute({
    method: "post",
    path : '/{sportId}',
    tags: ["Tournaments"],
    description: "Create a new tournament for a specific sport",
    security: [{ bearerAuth: [] }],
    request:{
      params: z.object({
        sportId: z.string(),
      }),
      body:{
        content: {
          "application/json": {
            schema: TournamentRequestSchema,
      },
    },
    },
  },
    middleware: [requireAuth, requireRole("ADMIN"), withTransaction],
    responses:{
      200: {description: "Tournament created successfully",
      content: {  
        "application/json": {
          schema: TournamentResponseSchema,
        },
      },
    },
    400: {description: "Bad Request",
      content: {
        "application/json": { 
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },  404:{
      description: "Sport Not Found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },500:{
      description: "Internal Server Error",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },  
    },
  },
  }),
  TournamentsController.createTournamentController
) 

export { tournamentsRoute, adminTournamentsRoute }
    