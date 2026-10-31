
import type { Context } from 'hono';
import logger from '@/config/logger';
import { makeError } from '@/shared/utils/error';

export async function errorHandlerMiddleware(err: Error, c: Context) {
    const { error, statusCode } = makeError(err);
    logger.error(error, 'Error occurred');
    // const errorContextData = {
    //   context: JSON.stringify(c, null, 2),   
    //   statusCode: statusCode,
    //   error: error,
    // };
    // sentryClient.captureException(err, { contexts: { data: errorContextData } });
    return c.json(error, { status: statusCode as any });
}
