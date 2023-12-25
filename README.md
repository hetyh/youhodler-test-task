# youhodler-test-task

## Task

Create a microservice that returns the current price of Bitcoin upon request. 

The initial quote must be obtained from the Binance exchange API.
```
https://binance-docs.github.io/apidocs/spot/en/#symbol-order-book-ticker
```

After obtaining the price, it is necessary to apply a 0.01% service commission to the bid and ask, and calculate the mid price.
These values should be returned by the microservice via an HTTP request.

The price needs to be updated every 10 seconds.

The update frequency, service commission, and HTTP port should be configurable through environment variables.
The project should include a Dockerfile to run the application.

## Environment variables

- `SERVICE_COMMISSION_PERCENT`  
- `TICKER_UPDATE_CRON_INTERVAL`
- `HTTP_PORT`
- `TICKER_SYMBOL`

## Routes

- `GET /price` - returns price data of the selected ticker
