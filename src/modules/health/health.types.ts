import {z} from 'zod';

//health check response schema

export const HealthResponseSchema = z.object({
  status: z.string().openapi({ example: 'ok' }),
  database: z.string().openapi({ example: "connected"}),
  uptime: z.number().openapi({ example: 1234.56}),
  timestamp:z.string().datetime().openapi({ example: "2024-06-01T12:00:00Z" }),
});

export const HealthErrorResponseSchema = z.object({
  status: z.string().openapi({ example: 'error' }),
  database: z.string().openapi({ example: "disconnected"}),

});

//inferred types
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type HealthErrorResponse = z.infer<typeof HealthErrorResponseSchema>;
