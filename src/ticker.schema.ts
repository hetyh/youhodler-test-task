import { FastifySchema } from "fastify";

export const tickerSchema: FastifySchema = {
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
