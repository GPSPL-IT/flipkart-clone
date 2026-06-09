import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import userRouter from "./routes/user.route.js"
import productRouter from "./routes/product.route.js"

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

// user routes
app.use("/api/users", userRouter)
// product routes
app.use("/api/products", productRouter)


app.listen(process.env.PORT || 3005, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})