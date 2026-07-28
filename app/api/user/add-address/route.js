import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import connectDB from '@/config/db';
import Address from '@/models/Address';

export async function POST(request) {
  // Implementation for adding address
  try{

    const auth = getAuth(request);
    const userId = auth?.userId;

    //const userId = getAuth(request)?.userId;
    const { address } = await request.json();

    await connectDB();

    const newAddress = await Address.create({...address, userId });

    return NextResponse.json({ success: true, message: 'address added', newAddress});

  }catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}