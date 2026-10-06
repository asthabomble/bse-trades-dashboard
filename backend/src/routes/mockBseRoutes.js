const express = require("express");
const { generateTrades } = require("../services/tradeGenerator");

const router = express.Router();

router.get("/getTrades", async (req, res) => {
  const delay = Number(process.env.MOCK_BSE_DELAY_MS || 10000);

  console.log(`Mock BSE pull started. Delay: ${delay}ms`);

  setTimeout(() => {
    const trades = generateTrades(3000);

    console.log(`Mock BSE pull completed. ${trades.length} trades`);

    res.json({
      success: true,
      count: trades.length,
      trades
    });
  }, delay);
});

module.exports = router;