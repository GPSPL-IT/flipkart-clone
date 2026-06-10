import express from "express"
import { createProduct } from "../controllers/admin.controller.js"
import { upload } from "../middleware/multer.js"
const router = express.Router()

router.post("/product", upload.single("image"), createProduct)

export default router