import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import Papa from "papaparse";
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request) {
    try {
        await connectDB();
        const formData = await request.formData();
        const file = formData.get("file");
        
		const auth = getAuth(request);
        const userId = auth?.userId;
		const sellerId = await User.findById(userId);
		 

        if (!sellerId) {
            return NextResponse.json({ success: false, message: "Bulk upload rejected: Missing seller identity context." }, { status: 400 });
        }
        if (!file) {
            return NextResponse.json({ success: false, message: "No data payload CSV file detected." }, { status: 400 });
        }

        // 1. Read binary attachment streams straight back to a raw text string context
        const rawCsvText = await file.text();

        // 2. Parse text string lines into structured row object indices via PapaParse parameters
        const parsedResult = Papa.parse(rawCsvText, {
            header: true, // Uses the first line row headers as keys dynamically
            skipEmptyLines: true, // Ignores blank trailing rows cleanly
            trimHeaders: true // Wipes out extra empty spaces around header words
        });

        const incomingRows = parsedResult.data;

        if (!Array.isArray(incomingRows) || incomingRows.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid CSV formatting layout. No records found." }, { status: 400 });
        }

        let parsedUploadsCount = 0;
        const finalBatchPayload = [];

        // Pre-fetch active system records to prevent unique index lock collisions
        const existingProducts = await Product.find({}, { productCode: 1 });
        const existingCodesSet = new Set(existingProducts.map(p => p.productCode?.toUpperCase()));

        for (const row of incomingRows) {
            // Strict field presence safeguards validations - Checks matching target header tokens
            if (!row.name || !row.productCode || !row.price || !row.offerPrice) {
                continue; // Skip incomplete layout line tracks automatically
            }

            const codeToken = row.productCode.toString().trim().toUpperCase();

            // Skip item if code match identifier is already active in database rows
            if (existingCodesSet.has(codeToken)) {
                continue; 
            }

            // Safe parsing utility translations for string variables arriving from CSV cells
            const cleanPrice = parseFloat(row.price) || 0;
            const cleanOfferPrice = parseFloat(row.offerPrice) || 0;
            const cleanStock = parseInt(row.Stock || row.stock) || 50;

            // Handle string true/false boolean conversions safely
            const isActiveFlag = row.isActive ? row.isActive.toString().toLowerCase() === "true" : true;
            const isPopularFlag = row.isPopular ? row.isPopular.toString().toLowerCase() === "true" : false;

            // Handle multi-image commas splits patterns safely if present in single string cells
            let imageArray = ["https://unsplash.com"];
            if (row.image && row.image.trim() !== "") {
                imageArray = row.image.split(",").map(url => url.trim());
            }

            finalBatchPayload.push({
                userId: sellerId,
                name: row.name.trim(),
                productCode: codeToken,
                description: row.description?.trim() || "Premium fireworks item manufactured by KanSan.",
                brand: row.Brand || row.brand || "KanSan",
                size: row.Size || row.size || "1BOX/10 PCS",
                price: cleanPrice,
                offerPrice: cleanOfferPrice,
                category: row.Category?.trim().toUpperCase() || "UNCATEGORIZED",
                stock: cleanStock,
                image: imageArray,
                isActive: isActiveFlag,
                isPopular: isPopularFlag,
                date: row.date ? parseInt(row.date) || Date.now() : Date.now()
            });

            existingCodesSet.add(codeToken); // Guard against self-duplication inside single file batches
            parsedUploadsCount++;
        }

        if (finalBatchPayload.length === 0) {
            return NextResponse.json({ success: false, message: "No new items were imported. All product codes inside the CSV already exist." }, { status: 400 });
        }

        // Batch insert models into MongoDB
        await Product.insertMany(finalBatchPayload);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully batch-imported ${parsedUploadsCount} new products from CSV file into your seller catalog!` 
        });

    } catch (error) {
        console.error("Critical bulk-import database failure exception logs:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
