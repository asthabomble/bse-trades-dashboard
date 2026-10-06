const symbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"];

function generateTrades(count = 3000) {
  const trades = [];

  for (let i = 1; i <= count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    trades.push({
      tradeId: `TRD-${Date.now()}-${i}`,
      client: `CLIENT-${(i % 100) + 1}`,
      symbol,
      quantity: Math.floor(Math.random() * 1000) + 1,
      price: Number((Math.random() * 3000 + 100).toFixed(2)),
      timestamp: new Date()
    });
  }

  return trades;
}

module.exports = { generateTrades };