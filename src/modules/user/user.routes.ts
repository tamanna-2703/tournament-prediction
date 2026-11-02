import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import * as UserController from './user.controller'
import {
    RegisterRequestSchema,
    RegisterResponseSchema,
} from './user.types'
import { withTransaction } from '@/middleware/transaction.middleware'

const userRoutes = new OpenAPIHono()

userRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/register',
        tags: ['User'],
        description: 'Register a new user account. Creates a new user profile with the provided information including username, email, and password. Returns the created user details.',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: RegisterRequestSchema,
                    },
                },
            },
        },
        middleware: [withTransaction],
        responses: {
            200: {
                description: 'User registered successfully',
                content: {
                    'application/json': {
                        schema: RegisterResponseSchema,
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
            409: {
                description: 'User already exists',
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
    UserController.registerController
)

export default userRoutes
