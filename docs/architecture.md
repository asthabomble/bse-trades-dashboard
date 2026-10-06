# Architecture

## System Flow

React Dashboard
       |
       | REST + Socket.IO
       v
Node.js / Express
       |
       | POST /trades/pull
       v
Background Trade Pull Service
       |
       | GET /mock-bse/getTrades
       v
Mock BSE API
       |
       | 10 sec development delay
       v
MongoDB Atlas
       |
       | trades-updated event
       v
Socket.IO
       |
       v
React Dashboard

## Request Flow

1. User clicks "Pull Latest Trades".
2. Frontend sends POST /trades/pull.
3. Backend immediately responds with HTTP 202 Accepted.
4. Backend starts the trade pull without keeping the browser request open.
5. Mock BSE API simulates the long-running BSE request.
6. Retrieved trades are stored in MongoDB.
7. Backend emits a `trades-updated` Socket.IO event.
8. Dashboard receives the event and fetches the latest trades.
9. The table updates without page refresh or polling.

## Why This Architecture?

The real BSE API can take up to 15 minutes while the network may terminate
HTTP connections after 30 seconds. Therefore, the application does not keep
the frontend HTTP request open during the pull.

Instead, the pull is handled asynchronously and the frontend is notified
using WebSockets when the operation finishes.

## Technologies

- React + Vite
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO
- Axios