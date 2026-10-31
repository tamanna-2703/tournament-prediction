import {z} from 'zod';

export const TokenRequestSchema = z.object ({
  email: z.email().default('user@test.com'),
})

export const TokenResponseSchema = 
z.object ({
  token: z.string(),
})

export type TokenRequest = z.infer<typeof TokenRequestSchema>
export type TokenResponse = z.infer<typeof TokenResponseSchema>