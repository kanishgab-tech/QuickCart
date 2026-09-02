// seed.js
import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import Product from "./models/Product.js"; // Adjust this path to your actual Product model location
import User from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
    try {

       // 2. Clear out older legacy product items to wipe out unique index conflicts
        await Product.deleteMany({});
        console.log("🗑️ Cleared out old product catalog rows successfully.");

        // 3. Read and parse your generated JSON test file data
        const rawData = fs.readFileSync("./product.json", "utf-8");
        const productsList = JSON.parse(rawData);

                    
            // 3. Dynamically add the required userId to every product
            const productsWithUser = productsList.map(product => ({
            ...product,
            userId: dummyUser._id // Attach the required ID here
            }));

        // 4. Batch insert your clean product models
        await Product.insertMany(productsWithUser);
        console.log(`✅ Successfully seeded ${productsList.length} products with unique Item Codes!`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Critical database seeding exception:", error.message);
        process.exit(1);
    }
};

seedDatabase();
