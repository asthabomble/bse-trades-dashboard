import { useEffect, useState } from "react";
import { getTrades, startPull } from "./services/api";
import { socket } from "./services/socket";
import "./App.css";

function App() {
  const [trades, setTrades] = useState([]);
  const [pulling, setPulling] = useState(false);
  const [message, setMessage] = useState("Ready");

  useEffect(() => {
    loadTrades();

    socket.on("trades-updated", async (data) => {
      setMessage(`${data.count} new trades received`);
      setPulling(false);
      await loadTrades();
    });

    socket.on("pull-failed", () => {
      setMessage("Trade pull failed");
      setPulling(false);
    });

    return () => {
      socket.off("trades-updated");
      socket.off("pull-failed");
    };
  }, []);

  async function loadTrades() {
    try {
      const response = await getTrades();
      setTrades(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load trades");
    }
  }

  async function handlePull() {
    try {
      setPulling(true);
      setMessage("Pulling latest trades from BSE...");

      await startPull();
    } catch (error) {
      setPulling(false);
      setMessage(
        error.response?.data?.message || "Failed to start pull"
      );
    }
  }

  return (
    <div className="app">
      <div className="header">
        <div className="title">
          <h1>BSE Trades Dashboard</h1>
          <p>Real-time trade monitoring</p>
        </div>

        <button
          className="pull-button"
          onClick={handlePull}
          disabled={pulling}
        >
          {pulling ? "Pull in Progress..." : "Pull Latest Trades"}
        </button>
      </div>

      <div className="status">
        <strong>Status:</strong> {message}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Trade ID</th>
              <th>Client</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {trades.map((trade) => (
              <tr key={trade.tradeId}>
                <td>{trade.tradeId}</td>
                <td>{trade.client}</td>
                <td className="symbol">{trade.symbol}</td>
                <td>{trade.quantity}</td>
                <td className="price">₹{trade.price}</td>
                <td>
                  {new Date(trade.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;