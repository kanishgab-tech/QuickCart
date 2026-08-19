import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import nodemailer from "nodemailer";
import authSeller from "@/lib/authSeller";

export async function POST(request) {
    try {
        // 1. SECURITY HANDSHAKE: Authenticate session via Clerk
        const auth = getAuth(request);
        const userId = auth?.userId;

        const isSeller=await authSeller(userId)
                if(!isSeller)
                    {
                            return NextResponse.json({success:false, message: 'Not Authorized'})
                    }


        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ success: false, message: "Missing required orderId payload token." }, { status: 400 });
        }

        await connectDB();

        
        // 3. FETCH COMPREHENSIVE CURRENT ORDER DATA snap-shot state from MongoDB
        const currentOrder = await Order.findById(orderId).populate('items.product');
        if (!currentOrder) {
            return NextResponse.json({ success: false, message: "Target order record not found in system storage." }, { status: 404 });
        }

        // 4. RESOLVE TARGET NOTIFICATION EMAIL
        const customerEmail = currentOrder.isGuest 
            ? currentOrder.guestEmail 
            : (currentOrder.guestEmail || currentOrder.customerEmail || currentOrder.email);

        if (!customerEmail) {
            return NextResponse.json({ success: false, message: "Unable to locate a valid customer email identifier for this order." }, { status: 422 });
        }

        // 5. CONFIGURE NODEMAILER SMTP TRANSPORTER POOL
            const transporter = nodemailer.createTransport({
                                                   host: "smtp.gmail.com",
                                                   port: 465,       // Port for secure SSL
                                                   secure: true,    // Use SSL natively
                                                   auth: {
                                                       user: process.env.EMAIL_USER, 
                                                       pass: process.env.EMAIL_PASS  
                                                   }
                                               });
                        

        // 6. DISPATCH REAL-TIME TRANSACTION RECEIPT EMAIL
        await transporter.sendMail({
            from: `"QuickCart Updates" <${process.env.SMTP_USER}>`, 
            to: customerEmail.trim().toLowerCase(),
            subject: `🔔 Latest Transaction Summary & Status: ${currentOrder.orderNumber}`,
            html: `
                <div style="font-family: sans-serif; padding: 24px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 32px;">📦</span>
                        <h2 style="color: #ea580c; margin: 6px 0 0 0;">Order Status Update Notification</h2>
                        <p style="font-size: 12px; color: #9ca3af; margin: 4px 0 0 0;">Ref Code: ${currentOrder.orderNumber}</p>
                    </div>

                    <p style="font-size: 14px;">Hello,</p>
                    <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">
                        Per your request, here is the updated tracking summary, shipping information, and live logistics status for your order on our store.
                    </p>
                    
                    
                    <div style="background-color: #fff7ed; border: 1px solid #ffedd5; padding: 14px; border-radius: 10px; margin: 16px 0; text-align: center;">
                        <span style="font-size: 10px; font-weight: bold; color: #c2410c; uppercase text-transform: tracking-wide; display: block; margin-bottom: 2px;">Current Fulfillment Phase</span>
                        <span style="font-size: 18px; font-weight: 900; color: #ea580c;">✨ ${currentOrder.status}</span>
                    </div>

                    
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <h4 style="margin-top: 0; text-transform: uppercase; font-size: 10px; color: #9ca3af; tracking: 0.5px; margin-bottom: 6px;">Shipping Destination</h4>
                        <p style="font-size: 13px; font-weight: bold; white-space: pre-line; margin: 0; color: #111827; line-height: 1.4;">${currentOrder.address}</p>
                    </div>

                    
                    <h4 style="text-transform: uppercase; font-size: 10px; color: #9ca3af; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; margin-top: 20px;">Order Items Breakdown</h4>
                    <ul style="list-style: none; padding-left: 0; font-size: 13px; color: #4b5563; margin-top: 8px;">
                        ${currentOrder.items.map(item => `
                            <li style="padding: 8px 0; border-bottom: 1px dashed #f3f4f6; display: flex; justify-content: space-between;">
                                <span>${item.product?.name || "Product Item"}</span> 
                                <span style="color: #ea580c; font-weight: bold; margin-left: auto;">x ${item.quantity}</span>
                            </li>
                        `).join('')}
                    </ul>

                   
                    <div style="margin-top: 20px; text-align: right; border-top: 2px solid #f3f4f6; padding-top: 12px; font-size: 12px; color: #4b5563; line-height: 1.6;">
                        <div>Shipping Logistics charges: <strong>₹${currentOrder.shippingCharges || 0}</strong></div>
                        ${currentOrder.discountAmount > 0 ? `<div>Promo Deductions: <span style="color: #16a34a;">&minus;₹${currentOrder.discountAmount}</span></div>` : ''}
                        <div style="font-size: 14px; font-weight: bold; color: #111827; margin-top: 4px;">
                            Grand Total Invoiced: <span style="font-size: 20px; font-weight: 900; color: #ea580c;">₹${currentOrder.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    ${currentOrder.notes ? `
                        <div style="margin-top: 20px; font-size: 11px; color: #c2410c; background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px; border-radius: 4px;">
                            <strong style="display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 10px;">Logistics Comments / Courier IDs:</strong> ${currentOrder.notes}
                        </div>
                    ` : ''}

                    <p style="font-size: 11px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 12px; text-align: center;">
                        Thank you for shopping with us. This email was manually triggered and dispatched from our server administrative tools.
                    </p>
                </div>
            `
        });

        return NextResponse.json({ success: true, message: `Notification receipt successfully re-dispatched to ${customerEmail}` }, { status: 200 });

    } catch (error) {
        console.error("Manual Email Re-dispatch Endpoint Failure:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal server error occurred." }, { status: 500 });
    }
}
