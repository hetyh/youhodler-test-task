import Cron from 'croner'
import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import fastifySensible from '@fastify/sensible'


const requiredEnvValues = ['SERVICE_COMMISSION_PERCENT', 'TICKER_UPDATE_CRON_INTERVAL', 'HTTP_PORT', 'TICKER_SYMBOL']
const missingEnvValues = requiredEnvValues.filter(envVar => process.env[envVar] == null)
if (missingEnvValues.length > 0) {
  console.error(`Missing env values: ${missingEnvValues.join(', ')}`)
  process.exit(1)
}


interface ISymbolInfo {
  symbol: string
  bidPrice: number
  bidQty: number
  askPrice: number
  askQty: number
  midPrice: number
}

const commissionMultiplier = (100 + Number(process.env.SERVICE_COMMISSION_PERCENT)) / 100
const tickerMap = new Map<string, Pick<ISymbolInfo, 'askPrice' | 'bidPrice' | 'midPrice'>>()
Cron(process.env.TICKER_UPDATE_CRON_INTERVAL as string, async () => {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${process.env.TICKER_SYMBOL}`)
    const data = await res.json() as Omit<ISymbolInfo, 'midPrice'>

    tickerMap.set(data.symbol, {
      bidPrice: Number(data.bidPrice) * commissionMultiplier,
      askPrice: Number(data.askPrice) * commissionMultiplier,
      midPrice: (Number(data.askPrice) + Number(data.bidPrice)) / 2 * commissionMultiplier
    })

    server.log.info({ symbol: data.symbol, ...tickerMap.get(data.symbol) })
  } catch (error) {
    server.log.error(error)
  }
})


export const server: FastifyInstance = Fastify({
  logger: true
})

server.register(fastifySensible)

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string'
            },
            bidPrice: {
              type: 'number'
            },
            askPrice: {
              type: 'number'
            },
            midPrice: {
              type: 'number'
            }
          }
        }
      }
    }
  }
}

server.get('/ticker', opts, async (_request, reply) => {
  const tickerData = tickerMap.get(process.env.TICKER_SYMBOL as string)

  if (tickerData == null) {
    reply.notFound()
    return
  }

  return [{ symbol: process.env.TICKER_SYMBOL, ...tickerData }]
})

try {
  await server.listen({ port: Number(process.env.HTTP_PORT) })
} catch (error) {
  server.log.error(error)
  process.exit(1)
}

