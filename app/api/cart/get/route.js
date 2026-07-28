import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/config/db';
import User from '@/models/User';


export async function GET(request) 
{
    try{
        const auth = getAuth(request);
        const userId = auth?.userId;
        await connectDB();
        const user=await User.findById(userId);

        const { cartItems } = user;
        return NextResponse.json({ success: true, cartItems }, { status: 200 });
        
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }   

}