import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
//import mongoose from 'mongoose';

//import { setServers } from 'node:dns/promises';
//setServers(['1.1.1.1', '8.8.8.8']);


export async function GET(request) {
    const auth =  getAuth(request);
    const userId = auth?.userId;

    try {
        if (!userId) {
            return NextResponse.json({ success: false, message: "User Unauthorized" });
        }

        //console.log("User ID:", userId);
        await connectDB();

        const user = await User.findOne({ _id: userId });

        if (!user) {
            return NextResponse.json({ success: false, message: "User Not Found" });
        }

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Critical User Data Endpoint Failure:", error);
        return NextResponse.json({ success: false, message: error.message });
    }
}