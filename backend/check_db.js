import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";
import Category from "./models/category.model.js";
import User from "./models/user.model.js";

dotenv.config();

const test = async () => {
    try {
        const dbUri = process.env.MONGODB_URI;
        console.log("Connecting to:", dbUri);
        await mongoose.connect(dbUri);
        console.log("Connected successfully!");

        const userCount = await User.countDocuments({});
        const productCount = await Product.countDocuments({});
        const categoryCount = await Category.countDocuments({});

        console.log("Users count:", userCount);
        console.log("Products count:", productCount);
        console.log("Categories count:", categoryCount);

        if (productCount > 0) {
            const sample = await Product.findOne({});
            console.log("Sample product:", JSON.stringify(sample, null, 2));
        }

        if (categoryCount > 0) {
            const sampleCat = await Category.findOne({});
            console.log("Sample category:", JSON.stringify(sampleCat, null, 2));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Test failed:", err);
    }
};

test();
