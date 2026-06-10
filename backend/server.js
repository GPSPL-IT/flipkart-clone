import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import userRouter from "./routes/user.route.js"
import productRouter from "./routes/product.route.js"
import cartRouter from "./routes/cart.route.js"
import reviewRouter from "./routes/review.route.js"
import orderRouter from "./routes/order.route.js"
import adminRouter from "./routes/admin.route.js"
import categoryRouter from "./routes/category.route.js"

dotenv.config()

const app = express()

app.use(cors({ credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server is running")
})

// connect database (mongodb)
connectDB()

// user and auth routes
app.use("/api/users", userRouter)
app.use("/api/auth", userRouter)

// product routes
app.use("/api/products", productRouter)

// category routes
app.use("/api/categories", categoryRouter)

// cart routes
app.use("/api/cart", cartRouter)
// review routes
app.use("/api/reviews", reviewRouter)
// order routes
app.use("/api/orders", orderRouter)
// admin routes
app.use("/api/admin", adminRouter)

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`)
})