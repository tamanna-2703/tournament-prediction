import { z } from 'zod'
import { UserRole } from '@/db/types'

export const RegisterRequestSchema = z.object({
    email: z.email().default('user@test.com'),
    role: z.enum(UserRole).default(UserRole.USER),
})

export const RegisterResponseSchema = z.object({
    user: z.object({
        id: z.string(),
        email: z.string(),
        role: z.enum(UserRole),
    }),
    wallet: z.object({
        id: z.string(),
        balance: z.number(),
    }),
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>
