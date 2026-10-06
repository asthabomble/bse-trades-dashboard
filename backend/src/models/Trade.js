const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema(
  {
    tradeId: {
      type: String,
      required: true,
      unique: true
    },
    client: String,
    symbol: String,
    quantity: Number,
    price: Number,
    timestamp: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Trade", tradeSchema);