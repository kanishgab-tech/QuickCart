import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import User from '@/models/User';


export async function POST(request) 
{
    try{
         //const { userID } = await getAuth(request);
        const auth = getAuth(request);
        const userId = auth?.userId;

        //const { userId } = await getAuth(request);
        const { cartData } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await connectDB();
        const user= await User.findById(userId);
        
        if (!user) {
            return NextResponse.json({ 
                error: `User database profile not found for ID: ${userId}` 
            }, { status: 404 });
        }
        
        user.cartItems = cartData;
        await user.save();

        return NextResponse.json({ success: true });
    } 
    catch (error) {
        console.error('Error updating cart:', error);
        return NextResponse.json({ success: false, message: error.message });
    }
}
