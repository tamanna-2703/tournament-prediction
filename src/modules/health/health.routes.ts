import {createRoute, OpenAPIHono} from '@hono/zod-openapi';
import * as HealthController from "@/modules/health/health.controller";
import {HealthErrorResponseSchema, HealthResponseSchema} from "@/modules/health/health.types";

export const healthRouter = new OpenAPIHono();

healthRouter.openapi(
  createRoute({
    method: "get",
    path: "/health",
    tags: ["Health"],
    description: "Check the health of the application and database connection",
    responses: {
      200: {
        description: "Application is healthy and database is connected",
        content: {
          "application/json": {
            schema: HealthResponseSchema,
          },
        },
      },
      500: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: HealthErrorResponseSchema,
          },
        },
      },
    },
  }),
  HealthController.getHealthController
);
export default healthRouter;