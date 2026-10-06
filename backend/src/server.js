require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const mockBseRoutes = require("./routes/mockBseRoutes");
const tradeRoutes = require("./routes/tradeRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"
  }
});

app.set("io", io);

app.use(cors());
app.use(express.json());

app.use("/mock-bse", mockBseRoutes);
app.use("/trades", tradeRoutes);

io.on("connection", (socket) => {
  console.log("Dashboard connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Dashboard disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });