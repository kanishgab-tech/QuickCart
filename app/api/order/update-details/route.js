import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Tax from "@/models/Tax";
import nodemailer from "nodemailer"; // NEW: Import Nodemailer core package
import authSeller from "@/lib/authSeller";

export async function POST(request) {
    try {
        const auth = getAuth(request);
        const userId = auth?.userId;

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const isSeller=await authSeller(userId)
                if(!isSeller)
                    {
                            return NextResponse.json({success:false, message: 'Not Authorized'})
                    }

        const body = await request.json();
        const { orderId, address, items, notes } = body;

        if (!orderId || !address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Missing required parameter details." }, { status: 400 });
        }

        await connectDB();

        // 1. Recalculate Subtotal from Products Collection
        let newSubtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.product._id || item.product);
            if (product) {
                newSubtotal += product.offerPrice * item.quantity;
            }
        }

        // 2. Fetch Original Order to gather dynamic coupon codes framework parameters
        const originalOrder = await Order.findById(orderId);
        if (!originalOrder) {
            return NextResponse.json({ success: false, message: "Order records not found." }, { status: 404 });
        }

        // Re-evaluate discount value if percentage-based coupon was active
        let newDiscount = originalOrder.discountAmount;
        if (originalOrder.couponCode && originalOrder.discountAmount > 0) {
            if (originalOrder.discountAmount === (originalOrder.amount + originalOrder.discountAmount - originalOrder.shippingCharges) * 0.1) {
                newDiscount = Math.round((newSubtotal * 0.1) * 100) / 100;
            }
        }

        // Re-evaluate dynamic shipping logistics parameters
        const newShipping = newSubtotal >= 2000 || originalOrder.couponCode === "FREESHIP" ? 0 : 150;

        // 3. Re-evaluate Multi-Component Tax Values Matrix from Database
        const dbTaxComponents = await Tax.find({});
        const taxableBasis = Math.max(0, newSubtotal - newDiscount);
        let newTotalTax = 0;
        
        dbTaxComponents.forEach((taxRule) => {
            newTotalTax += (taxableBasis * taxRule.value) / 100;
        });
        newTotalTax = Math.round(newTotalTax * 100) / 100;

        // 4. Compute Final Verified Grand Total
        const newGrandTotal = Math.max(0, (newSubtotal + newShipping + newTotalTax) - newDiscount);

        // 5. Persist updated fields to MongoDB and populate product references
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                address: address.trim(),
                items: items.map(i => ({ product: i.product._id || i.product, quantity: Number(i.quantity) })),
                amount: newGrandTotal,
                shippingCharges: newShipping,
                discountAmount: newDiscount,
                tax: newTotalTax,
                notes: notes ? notes.trim() : originalOrder.notes
            },
            { returnDocument: "after", runValidators: true }
        ).populate('items.product');

        // 6. TARGET DETERMINATION: Determine correct email address from user payload type
         const customerEmail = originalOrder.isGuest 
            ? originalOrder.guestEmail 
            : (originalOrder.guestEmail || originalOrder.customerEmail || originalOrder.email); 

        if (customerEmail) {
            try {
                // 7. SETUP NODEMAILER SMTP TRANSPORTER: Read variables straight from process.env configurations
                const transporter = nodemailer.createTransport({
                                           host: "smtp.gmail.com",
                                           port: 465,       // Port for secure SSL
                                           secure: true,    // Use SSL natively
                                           auth: {
                                               user: process.env.EMAIL_USER, 
                                               pass: process.env.EMAIL_PASS  
                                           }
                                       });
                

                // 8. DIRECT SYNCHRONOUS MAIL TRANSMISSION DISPATCH
                await transporter.sendMail({
                    from: `"QuickCart Updates" <${process.env.SMTP_USER}>`, 
                    to: customerEmail.trim().toLowerCase(),
                    subject: `⚠️ Order Modified Notification: ${originalOrder.orderNumber}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 24px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; margin: 0 auto;">
                            <h2 style="color: #ea580c; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-top: 0;">Your Order Has Been Updated</h2>
                            <p style="font-size: 14px;">Hello,</p>
                            <p style="font-size: 14px; line-height: 1.5; color: #4b5563;">
                                This email confirms that administrative changes were recently applied to your order <strong style="color: #111827;">${originalOrder.orderNumber}</strong> per your customer request.
                            </p>
                            
                            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
                                <h4 style="margin-top: 0; text-transform: uppercase; font-size: 10px; color: #9ca3af; tracking: 0.5px; margin-bottom: 6px;">Updated Shipping Destination</h4>
                                <p style="font-size: 13px; font-weight: bold; white-space: pre-line; margin: 0; color: #111827; line-height: 1.4;">${updatedOrder.address}</p>
                            </div>

                            <h4 style="text-transform: uppercase; font-size: 10px; color: #9ca3af; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; margin-top: 20px;">Revised Items Summary</h4>
                            <ul style="list-style: none; padding-left: 0; font-size: 13px; color: #4b5563; margin-top: 8px;">
                                ${updatedOrder.items.map(item => `
                                    <li style="padding: 8px 0; border-bottom: 1px dashed #f3f4f6; display: flex; justify-content: space-between;">
                                        <span>${item.product?.name || "Product Item"}</span> 
                                        <span style="color: #ea580c; font-weight: bold; margin-left: auto;">x ${item.quantity}</span>
                                    </li>
                                `).join('')}
                            </ul>

                            <div style="margin-top: 20px; text-align: right; border-top: 2px solid #f3f4f6; padding-top: 12px;">
                                <span style="font-size: 12px; font-weight: bold; color: #6b7280;">New Total Amount Paid:</span>
                                <p style="font-size: 22px; font-weight: 900; color: #ea580c; margin: 4px 0 0 0;">₹${updatedOrder.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>

                            ${notes ? `
                                <div style="margin-top: 20px; font-size: 11px; color: #c2410c; background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px; border-radius: 4px;">
                                    <strong style="display: block; margin-bottom: 4px; text-transform: uppercase; tracking-wide: 0.5px; font-size: 10px;">Seller Notes:</strong> ${notes.trim()}
                                </div>
                            ` : ''}

                            <p style="font-size: 11px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #f3f4f6; padding-top: 12px; text-align: center;">
                                Thank you for shopping with us. This is a direct transaction status correction alert.
                            </p>
                        </div>
                    `
                });
                console.log(`Server-side customer update email successfully transmitted via Nodemailer to ${customerEmail}`);
            } catch (emailError) {
                console.error("Direct server-side Nodemailer transport dispatch failed:", emailError);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Order details updated and notification dispatched successfully!",
            order: updatedOrder
        }, { status: 200 });

    } catch (error) {
        console.error("Order Details Modification Error:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal server error occurred." }, { status: 500 });
    }
}
