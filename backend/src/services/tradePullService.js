const axios = require("axios");
const Trade = require("../models/Trade");

async function pullTrades(io) {
  try {
    console.log("Starting BSE trade pull...");

    const response = await axios.get(
      "http://localhost:5000/mock-bse/getTrades",
      {
        timeout: 0
      }
    );

    const trades = response.data.trades;

    await Trade.insertMany(trades, {
      ordered: false
    });

    console.log(`${trades.length} trades stored in MongoDB`);

    io.emit("trades-updated", {
      count: trades.length,
      message: "New trades available"
    });

  } catch (error) {
    console.error("Trade pull failed:", error.message);

    io.emit("pull-failed", {
      message: "Trade pull failed"
    });
  }
}

module.exports = { pullTrades };