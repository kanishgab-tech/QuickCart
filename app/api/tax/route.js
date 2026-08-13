import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Tax from "@/models/Tax";


export async function GET() {
    try {
        await connectDB().catch(err => {
            throw new Error("Database connection timed out");
        });
        const taxesArray = await Tax.find({});
        
        // Convert array to Key-Value map
        const taxMap = taxesArray.reduce((acc, tax) => {
            acc[tax.key] = {
                type: tax.type,
                value: tax.value
            };
            return acc;
        }, {});

        return NextResponse.json(taxMap, { status: 200 });
    } catch (error) {
        console.error("Tax API Error:", error);
        return NextResponse.json({ error: "Failed to fetch taxes" }, { status: 500 });
    }
}
