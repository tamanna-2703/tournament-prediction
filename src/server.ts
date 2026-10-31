import {serve} from '@hono/node-server'
import { createApp } from './app';
import { createOpenAPIAppDocs } from '@/docs/openapi'
import { registerRoutes } from '@/routes'
import { envConfig } from '@/config/env'
import  logger  from '@/config/logger'
import { registerCrons } from '@/cron'

//createe appp
const app = createApp() 

//Attach openAPI docs to the app
createOpenAPIAppDocs(app)

//register routes
registerRoutes(app)

//Register crons
registerCrons()

serve({
  fetch: app.fetch,
  port: envConfig.APP_PORT,
},
()=>{
  logger.info(
    {
      port: envConfig.APP_PORT, stage: envConfig.STAGE
    },'🚀 Server started successfully'
  )
}
)
