
import { NextResponse } from 'next/server';
import connectDB from "@/config/db";
import Product from "@/models/Product";

export  async function GET(request) {
    try{
        await connectDB();
        const products = await Product.find({});
        return NextResponse.json({ success: true, products }, { status: 200 });
    }
    catch (error) {
        console.error('Error fetching  products:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}