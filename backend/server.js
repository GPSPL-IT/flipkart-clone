import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import orderRoutes from "./routes/order.route.js";
import reviewRoutes from "./routes/review.route.js";

app.use("/api/reviews", reviewRoutes);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(process.env.PORT || 3005, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});