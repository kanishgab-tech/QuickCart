import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Address from "@/models/Address";
import Order from "@/models/Order";
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";



export async function GET(request)
{
    try 
    {
        const auth = getAuth(request);
        const userId = auth?.userId;

        const isSeller=await authSeller(userId)
        if(!isSeller)
        {
            return NextResponse.json({success:false, message: 'Not Authorized'})
        }
        
        await connectDB()
    
        //const addresses=await Address.find({userId})
        //const product=await Product.find({userId})
        Address.length
        Product.length
        
        const orders=await Order.find({}).populate('address items.product')

        return NextResponse.json({success:true, orders})
        
    }
    catch(error)
    {
        return NextResponse.json({success:false, message:error.message})

    }
}