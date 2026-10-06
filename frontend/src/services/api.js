import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

export const getTrades = () => API.get("/trades");
export const startPull = () => API.post("/trades/pull");