import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Address from '@/models/Address';

export async function GET(request) {
    try{
         const auth = getAuth(request);
         const userId = auth?.userId;
        
        //const { userID } = await getAuth(request);
        await connectDB();
        

        const addresses=await Address.find({ userId: userId });
        return NextResponse.json({ success: true, addresses }, { status: 200 });

    }
    catch (error) {
        console.error('Error fetching address:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}