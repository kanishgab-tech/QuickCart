import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from '@/models/User';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request) {
    try {

         const auth = getAuth(request);
         const userId = auth?.userId;
         

        await connectDB();
        
        const formData = await request.formData();
        const file = formData.get("file");
        
        // 3. FIXED: Extract the seller's user ID passed from the frontend form metadata
        const sellerId = await User.findById(userId);

        if (!sellerId) {
            return NextResponse.json({ 
                success: false, 
                message: "Bulk upload rejected: Missing seller reference identity context." 
            }, { status: 400 });
        }

        const fileText = await file.text();
        const incomingProducts = JSON.parse(fileText);

        if (!Array.isArray(incomingProducts) || incomingProducts.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid payload layout formatting." }, { status: 400 });
        }

        let parsedUploadsCount = 0;
        const finalBatchPayload = [];

        // Fetch existing codes to optimize tracking lookups safely
        const existingProducts = await Product.find({}, { productCode: 1 });
        const existingCodesSet = new Set(existingProducts.map(p => p.productCode?.toUpperCase()));

        for (const item of incomingProducts) {
            if (!item.name || !item.productCode || !item.price || !item.offerPrice) {
                continue; 
            }

            const codeToken = item.productCode.toString().trim().toUpperCase();

            if (existingCodesSet.has(codeToken)) {
                continue; 
            }

            finalBatchPayload.push({
                // 4. FIXED: Map the validated seller ID into every item record to satisfy Mongoose requirements!
                userId: sellerId,
                
                name: item.name.trim(),
                productCode: codeToken,
                description: item.description?.trim() || "Premium fireworks item manufactured by KanSan.",
                price: Number(item.price),
                offerPrice: Number(item.offerPrice),
                category: item.category?.trim().toUpperCase() || "UNCATEGORIZED",
                stock: Number(item.stock || 50),
                brand: item.brand?.trim() || "KanSan",
                size: item.size?.trim() || "1BOX/10 PCS",
                image: Array.isArray(item.image) ? item.image : [item.image || "https://unsplash.com"],
                isActive: item.isActive !== undefined ? item.isActive : true,
                isPopular: item.isPopular !== undefined ? item.isPopular : false,
                date: Date.now()
            });

            existingCodesSet.add(codeToken);
            parsedUploadsCount++;
        }

        if (finalBatchPayload.length === 0) {
            return NextResponse.json({ success: false, message: "No new items were imported. All codes already exist." }, { status: 400 });
        }

        await Product.insertMany(finalBatchPayload);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully batch-imported ${parsedUploadsCount} new products into your seller store catalog!` 
        });

    } catch (error) {
        console.error("Critical bulk-import database failure exception logs:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
