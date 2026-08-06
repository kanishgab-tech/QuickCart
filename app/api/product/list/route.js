
import { NextResponse } from 'next/server';
import connectDB from "@/config/db";
import Product from "@/models/Product";

export  async function GET(request) {
    try{
        await connectDB();
          // { isActive: { $ne: false } } matches documents where isActive is true OR undefined (for old products)
        const products = await Product.find({ 
            isActive: { $ne: false } 
        }).sort({ createdAt: -1 }); // Optional: sorts newest products first
        return NextResponse.json({ success: true, products }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching  products:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}