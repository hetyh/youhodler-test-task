import Cron from 'croner'
import { server } from './app.js'

interface ITickerInfo {
    symbol: string
    bidPrice: number
    bidQty: number
    askPrice: number
    askQty: number
    midPrice: number
}

const commissionMultiplier = (100 + Number(process.env.SERVICE_COMMISSION_PERCENT)) / 100
export const tickerMap = new Map<string, Pick<ITickerInfo, 'askPrice' | 'bidPrice' | 'midPrice'>>()

const getTicker = async () => {
    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${process.env.TICKER_SYMBOL}`)
        const data = await res.json() as Omit<ITickerInfo, 'midPrice'>

        tickerMap.set(data.symbol, {
            bidPrice: Number(data.bidPrice) * commissionMultiplier,
            askPrice: Number(data.askPrice) * commissionMultiplier,
            midPrice: (Number(data.askPrice) + Number(data.bidPrice)) / 2 * commissionMultiplier
        })

        server.log.info({ symbol: data.symbol, ...tickerMap.get(data.symbol) })
    } catch (error) {
        server.log.error(error)
    }
}

Cron(process.env.TICKER_UPDATE_CRON_INTERVAL as string, getTicker)
