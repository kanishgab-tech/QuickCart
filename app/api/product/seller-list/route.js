
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import authSeller from '@/lib/authSeller';
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
    try{

        //const { userID } = await getAuth(request);
        const auth = getAuth(request);
        const userId = auth?.userId;

        if (!userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: 'Not a seller!!' }, { status: 403 });
        }

        await connectDB();

        const products = await Product.find({});
        return NextResponse.json({ success: true, products }, { status: 200 });

    }
    catch (error) {
        console.error('Error fetching seller products:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}