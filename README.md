# Zerodha Backend OrderBook

A simple cryptocurrency exchange backend API that handles order matching and execution for a trading pair (SOL/USDT).

## Features

- User management with balance tracking
- Order placement (BID/ASK)
- Automated order matching and execution
- Order book depth viewing
- Balance checking functionality

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Zerodha-Backend-OrderBook.git

# Navigate to the project directory
cd Zerodha-Backend-OrderBook/ZerodhaBackend

# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3000`.

## API Endpoints

### Place an Order
- **Endpoint**: `POST /order`
- **Body**:
  ```json
  {
    "side": "BID" or "ASK",
    "quantity": number,
    "price": number,
    "userId": string
  }
  ```
- **Response**:
  ```json
  {
    "filledQuantity": number
  }
  ```

### Get Order Book Depth
- **Endpoint**: `GET /depth`
- **Response**:
  ```json
  {
    "depth": {
      "price1": {
        "type": "bid" or "ask",
        "quantity": number
      },
      "price2": {
        "type": "bid" or "ask",
        "quantity": number
      }
    }
  }
  ```

### Get User Balance
- **Endpoint**: `GET /getBalance/:userId`
- **Response**:
  ```json
  {
    "balance": {
      "SOL": number,
      "USDT": number
    }
  }
  ```

## Example Usage

### Check Initial Balance
```
GET http://localhost:3000/getBalance/1
```

### Place a Buy Order
```
POST http://localhost:3000/order
Content-Type: application/json

{
  "side": "BID",
  "quantity": 2,
  "price": 50,
  "userId": "1"
}
```

### Place a Sell Order
```
POST http://localhost:3000/order
Content-Type: application/json

{
  "side": "ASK",
  "quantity": 3,
  "price": 52,
  "userId": "2"
}
```

### View Order Book Depth
```
GET http://localhost:3000/depth
```

## User Data

The system initializes with two users:
- User 1: 10 SOL, 50,000 USDT
- User 2: 10 SOL, 50,000 USDT

## Order Matching Logic

- BID orders are matched against existing ASK orders with prices less than or equal to the BID price
- ASK orders are matched against existing BID orders with prices greater than or equal to the ASK price
- Orders are executed on a price-time priority basis
