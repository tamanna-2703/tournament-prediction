import { OpenAPIHono } from '@hono/zod-openapi';
import {cors} from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { logger as honoLogger } from 'hono/logger';
import { errorHandlerMiddleware } from './middleware/error.handler';

export function createApp() {
const app = new OpenAPIHono();

app.use('*',honoLogger())
app.use('*', prettyJSON())
app.use(
  '*',
  cors({
    origin:['http://localhost:7700'],
    credentials: true,
  })
)

app.onError(errorHandlerMiddleware);
return app
}
