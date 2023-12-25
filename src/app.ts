import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import fastifySensible from '@fastify/sensible'
import { tickerMap } from './ticker.service.js'
import { tickerSchema } from './ticker.schema.js'

const requiredEnvValues = ['SERVICE_COMMISSION_PERCENT', 'TICKER_UPDATE_CRON_INTERVAL', 'HTTP_PORT', 'TICKER_SYMBOL']
const missingEnvValues = requiredEnvValues.filter(envVar => process.env[envVar] == null)
if (missingEnvValues.length > 0) {
  console.error(`Missing env values: ${missingEnvValues.join(', ')}`)
  process.exit(1)
}

export const server: FastifyInstance = Fastify({
  logger: true
})

server.register(fastifySensible)

const opts: RouteShorthandOptions = {
  schema: tickerSchema
}

server.get('/price', opts, async (_request, reply) => {
  const tickerData = tickerMap.get(process.env.TICKER_SYMBOL as string)

  if (tickerData == null) {
    reply.notFound()
    return
  }

  return [{ symbol: process.env.TICKER_SYMBOL, ...tickerData }]
})

server.listen({ 
  host: '0.0.0.0', 
  port: Number(process.env.HTTP_PORT) 
}).catch(err => {
  server.log.error(err);
  process.exit(1)
})

process.on('SIGTERM', async () => {
  await server.close()
  process.exit(0)
})
