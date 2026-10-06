const express = require("express");
const Trade = require("../models/Trade");
const { pullTrades } = require("../services/tradePullService");

const router = express.Router();

let pullInProgress = false;

router.post("/pull", async (req, res) => {
  if (pullInProgress) {
    return res.status(409).json({
      message: "A pull is already in progress"
    });
  }

  pullInProgress = true;

  // Respond immediately
  res.status(202).json({
    message: "Trade pull started"
  });

  try {
    await pullTrades(req.app.get("io"));
  } finally {
    pullInProgress = false;
  }
});

router.get("/", async (req, res) => {
  try {
    const trades = await Trade.find()
      .sort({ timestamp: -1 })
      .limit(500);

    res.json(trades);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch trades"
    });
  }
});

module.exports = router;