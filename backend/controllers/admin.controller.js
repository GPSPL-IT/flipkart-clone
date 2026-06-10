import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// create product 
export const createProduct = async (req, res) => {
    try {
        const { title, description, price, discountPrecentage, category, brand, stock } = req.body;
        const imageFile = req.file;
        if (!title || !description || !price || !category || !brand || !stock || !imageFile) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
                
            })
        }
        
        const imageUpload = await uploadToCloudinary(imageFile.path);
        if (!imageUpload || !imageUpload.secure_url) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload image"
            });
        }

        const product = await Product.create({
            title,
            description,
            price,
            discountPrecentage,
            category,
            brand,
            stock,
            image: imageUpload.secure_url
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}