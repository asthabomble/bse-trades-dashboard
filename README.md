# BSE Trades Dashboard

A real-time trade monitoring dashboard built to handle long-running BSE trade pulls without keeping an HTTP connection open.

## Overview

This application simulates a BSE trade-data integration where a complete trade pull can take up to 15 minutes, while the network may terminate HTTP connections after approximately 30 seconds.

To solve this, the application uses asynchronous processing and Socket.IO for real-time event-based updates.

### Main Flow

1. User clicks **Pull Latest Trades**.
2. Backend immediately returns `202 Accepted`.
3. The trade pull continues asynchronously in the background.
4. Mock BSE API simulates the long-running operation.
5. Retrieved trades are stored in MongoDB.
6. Backend emits a Socket.IO event when the pull completes.
7. React dashboard receives the event.
8. Dashboard automatically loads the latest trades without a page refresh or application-level polling.

## Features

- Mock BSE `/getTrades` API
- Configurable BSE response delay
- 3,000 generated trade records per pull
- MongoDB Atlas persistence
- React + Vite dashboard
- Real-time updates using Socket.IO
- Existing trades remain visible while a pull is in progress
- Asynchronous long-running trade processing
- Immediate `202 Accepted` response
- Protection against simultaneous pulls
- No frontend polling loop
- Automatic dashboard updates
- Trade pull status and error handling

## Architecture

```text
                    ┌────────────────────────┐
                    │    React Dashboard     │
                    │                        │
                    │  Trade Table           │
                    │  Pull Latest Trades    │
                    └───────────┬────────────┘
                                │
                         REST + Socket.IO
                                │
                                ▼
                    ┌────────────────────────┐
                    │    Node.js / Express   │
                    │                        │
                    │  Trade Routes          │
                    │  Socket.IO Server      │
                    └───────────┬────────────┘
                                │
                         POST /trades/pull
                                │
                                ▼
                    ┌────────────────────────┐
                    │  Trade Pull Service    │
                    │                        │
                    │  Async Processing      │
                    └───────────┬────────────┘
                                │
                     GET /mock-bse/getTrades
                                │
                                ▼
                    ┌────────────────────────┐
                    │      Mock BSE API      │
                    │                        │
                    │  Configurable Delay    │
                    │  3,000 Trades          │
                    └───────────┬────────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │      MongoDB Atlas     │
                    │                        │
                    │     Trade Records      │
                    └───────────┬────────────┘
                                │
                         trades-updated
                                │
                                ▼
                    ┌────────────────────────┐
                    │    React Dashboard     │
                    │                        │
                    │  Automatically loads   │
                    │    latest trades       │
                    └────────────────────────┘
```

## Long-Running Request Handling

The actual BSE API may take up to 15 minutes to return all trades, while the network can terminate an HTTP connection after approximately 30 seconds.

Keeping the browser HTTP request open for the entire operation would therefore be unreliable.

Instead, the application uses an asynchronous workflow:

```text
User
 │
 │ POST /trades/pull
 ▼
Backend
 │
 ├──► Immediately returns 202 Accepted
 │
 └──► Starts trade pull
          │
          ▼
      Mock BSE API
          │
          │ Long-running operation
          ▼
      MongoDB Atlas
          │
          ▼
      Socket.IO Event
          │
          ▼
      React Dashboard
```

The browser does not wait for the long-running operation to finish.

## Real-Time Updates

Socket.IO is used for event-based communication between the backend and dashboard.

When the trade pull finishes successfully, the backend emits:

```javascript
io.emit("trades-updated", {
  count: trades.length,
  message: "New trades available"
});
```

The React dashboard listens for this event:

```javascript
socket.on("trades-updated", async (data) => {
  setMessage(`${data.count} new trades received`);
  setPulling(false);
  await loadTrades();
});
```

This allows the dashboard to update automatically without:

- Page refresh
- `setInterval()`
- Frontend polling
- Cron jobs
- Scheduler-based checks

## Technology Stack

### Frontend

- React
- Vite
- Axios
- Socket.IO Client
- CSS

### Backend

- Node.js
- Express.js
- Socket.IO
- Axios
- Mongoose

### Database

- MongoDB Atlas

## Project Structure

```text
bse-trades-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   │   └── Trade.js
│   │   ├── routes/
│   │   │   ├── mockBseRoutes.js
│   │   │   └── tradeRoutes.js
│   │   ├── services/
│   │   │   ├── tradeGenerator.js
│   │   │   └── tradePullService.js
│   │   ├── sockets/
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── docs/
│   └── architecture.md
│
├── README.md
└── .gitignore
```

## API Endpoints

### 1. Mock BSE API

```http
GET /mock-bse/getTrades
```

Returns generated trade data after the configured delay.

Example response:

```json
{
  "success": true,
  "count": 3000,
  "trades": [
    {
      "tradeId": "TRD-12345-1",
      "client": "CLIENT-1",
      "symbol": "TCS",
      "quantity": 250,
      "price": 3250.75,
      "timestamp": "2026-10-06T15:30:00.000Z"
    }
  ]
}
```

### 2. Start Trade Pull

```http
POST /trades/pull
```

The endpoint immediately returns:

```json
{
  "message": "Trade pull started"
}
```

HTTP status:

```text
202 Accepted
```

The actual trade pull continues asynchronously.

### 3. Get Stored Trades

```http
GET /trades
```

Returns stored trades from MongoDB.

The dashboard currently displays the latest 500 stored trades.

## Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
MOCK_BSE_DELAY_MS=10000
```

### Mock Delay

For development:

```env
MOCK_BSE_DELAY_MS=10000
```

This simulates a 10-second BSE response.

For a 15-minute simulation:

```env
MOCK_BSE_DELAY_MS=900000
```

For demonstration purposes, a shorter delay such as 10–30 seconds is recommended.

## Installation

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd bse-trades-dashboard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure MongoDB

Create:

```text
backend/.env
```

Add:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
MOCK_BSE_DELAY_MS=10000
```

Do not commit the `.env` file or expose the MongoDB credentials publicly.

### 4. Start the Backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Running the Application

1. Start MongoDB Atlas.
2. Start the backend using `npm run dev`.
3. Start the frontend using `npm run dev`.
4. Open `http://localhost:5173`.
5. Existing trades are loaded immediately.
6. Click **Pull Latest Trades**.
7. The button changes to **Pull in Progress...**.
8. The backend starts the asynchronous trade pull.
9. The Mock BSE API waits for the configured delay.
10. Trades are stored in MongoDB.
11. Backend emits the `trades-updated` Socket.IO event.
12. Dashboard receives the event.
13. Latest trades are loaded automatically.
14. No page refresh is required.

## Error Handling

### Pull Already in Progress

If another pull is already running, the API returns:

```http
409 Conflict
```

Response:

```json
{
  "message": "A pull is already in progress"
}
```

### Pull Failure

If the background trade pull fails, the backend emits:

```text
pull-failed
```

The dashboard displays:

```text
Trade pull failed
```

## Security

The MongoDB connection string is stored in an environment variable and should never be committed to the repository.

The root `.gitignore` contains:

```gitignore
node_modules/
.env
```

For production deployments, additional security measures should include:

- Secret management
- Authentication
- Authorization
- HTTPS
- Request validation
- Rate limiting
- Secure CORS configuration

## Production Considerations

The current implementation is designed for the technical assessment and local demonstration.

For a production environment, the background processing could be moved to a durable job queue and worker architecture:

```text
                    API Server
                        │
                        ▼
                    Job Queue
                        │
                        ▼
                Background Worker
                        │
                        ▼
                    BSE API
                        │
                        ▼
                    MongoDB
                        │
                        ▼
                  Socket.IO Event
                        │
                        ▼
                    Dashboard
```

This would provide better reliability if the API server restarts while a trade pull is running.

Possible production improvements include:

- Redis/BullMQ or another durable queue
- Persistent job status
- Retry mechanisms
- Dead-letter handling
- Authentication and authorization
- Rate limiting
- Structured logging
- Monitoring and alerting
- Horizontal scaling

## Assessment Requirements

| Requirement | Implementation |
|---|---|
| Mock BSE API | `GET /mock-bse/getTrades` |
| Few thousand records | 3,000 generated trades |
| Configurable delay | `MOCK_BSE_DELAY_MS` |
| 15-minute simulation | `900000 ms` configuration |
| 30-second network limitation | Asynchronous processing |
| Existing trades visible | Dashboard loads MongoDB data immediately |
| Automatic update | Socket.IO event |
| No page refresh | Event-driven update |
| No application-level polling | No `setInterval()` or polling loop |
| Persistent storage | MongoDB Atlas |
| Long-running operation | Background trade-pull service |
| Duplicate pull protection | `409 Conflict` |

## Production Build

To create a production build of the React frontend:

```bash
cd frontend
npm run build
```

The production build is generated in the `dist` directory.

## License

This project was developed as part of a Software Engineer technical assessment.