import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import {z} from 'zod';
import * as AuthController from './auth.controller'
import {TokenRequestSchema, TokenResponseSchema} from './auth.types'  

const authRoutes = new OpenAPIHono()

authRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/token',
    tags: ['Auth'],
    description: 'Generate a JWT authentication token for a user. Requires valid credentials (username/email and password). REturns an access token for subsequent authenticated requests.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: TokenRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successfully generated JWT token',
        content: {
          'application/json': {
            schema: TokenResponseSchema,
          },
        },
      },
      400: {
        description: 'Bad Request - Invalid input data',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string().describe('Error message describing the bad request'),
            }),
          },
        },
      },
      404:{
        description: 'User not found',
        content:{
          'application/json': {
            schema: z.object({
              error: z.string().describe('Error message indicating that the user was not found'),
            }), 
        },
      },
    },
    500:{
      description: 'Internal Server Error - An unexpected error occurred on the server',
      content:{
        'application/json': {
          schema: z.object({
            error: z.string().describe('Error message describing the internal server error'),
          }),
        },
      },
    },
  }
  }),
  AuthController.generateTokenController
)
export default authRoutes