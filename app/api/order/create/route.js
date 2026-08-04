import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import User from "@/models/User";
import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import { Resend } from "resend";

// Initialize Resend with your API Secret Key environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export const createUserOrder = inngest.createFunction(
    { 
        id: 'create-user-order',
        triggers: [{ event: 'order/created' }],
        batchEvents: {
            maxSize: 5,
            timeOut: '5s'
        }
    },
    async ({ events }) => {
        const eventList = events || [];
        const processedOrders = [];
        
        await connectDB();

        for (const singleEvent of eventList) {
            const payload = singleEvent.data || singleEvent;

            // 1. Map properties for MongoDB document
            const orderPayload = {
                orderNumber: payload.orderNumber,
                userId: payload.userId || null,
                isGuest: payload.isGuest || false,
                guestEmail: payload.guestEmail || null,
                items: payload.items,
                amount: payload.amount,
                address: payload.address,
                date: payload.date || Date.now() 
            };

            processedOrders.push(orderPayload);

            // 2. DYNAMICALLY DETERMINE RECIPIENT EMAIL ADDRESS
            let targetEmail = payload.guestEmail;

            if (!payload.isGuest && payload.userId) {
                // If they are a registered user, look up their email from the User schema
                const databaseUser = await User.findById(payload.userId);
                if (databaseUser && databaseUser.email) {
                    targetEmail = databaseUser.email;
                }
            }

            // 3. TRIGGER AUTOMATED INVOICE EMAIL DISPATCH IF EMAIL EXISTS
            if (targetEmail) {
                try {
                    await resend.emails.send({
                        from: "Shop Orders <kanishga.b@gmail.com>", // Replace with your verified Resend domain
                        to: targetEmail.trim(),
                        subject: `Order Confirmation - ${payload.orderNumber}`,
                        html: generateInvoiceHTML(payload, orderPayload.date) // Call HTML template builder
                    });
                    console.log(`Invoice email dispatched successfully to: ${targetEmail}`);
                } catch (emailError) {
                    console.error(`Failed to send invoice email for ${payload.orderNumber}:`, emailError);
                }
            }
        }
        
        if (processedOrders.length === 0) {
            return { success: false, message: "No valid orders found in this batch slice" };
        }
    
        // Insert array blocks securely inside MongoDB registry
        await Order.insertMany(processedOrders);  
        return { success: true, processed: processedOrders.length };
    }
);

// --- 4. PROFESSIONAL CLEAN HTML INVOICE LAYOUT TEMPLATE ---
function generateInvoiceHTML(payload, orderDate) {
    const formattedDate = new Date(orderDate).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    // Generate dynamic rows for items layout table
    const itemRowsHTML = payload.items.map(item => `
        <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 12px; font-size: 14px; color: #2d3748;">Product ID: ${item.product}</td>
            <td style="padding: 12px; font-size: 14px; color: #2d3748; text-align: center;">${item.quantity}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Order Invoice</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; padding: 24px; margin: 0;">
        <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            
            <!-- Email Header Banner Brand bar -->
            <div style="background-color: #ea580c; padding: 32px 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Order Confirmed!</h1>
                <p style="color: #ffedd5; margin: 8px 0 0 0; font-size: 14px;">Thank you for shopping with us.</p>
            </div>

            <!-- Main Metadata Grid box context -->
            <div style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; border-b: 1px solid #edf2f7; padding-bottom: 16px; margin-bottom: 20px;">
                    <div>
                        <span style="font-size: 10px; font-weight: bold; color: #a0aec0; text-transform: uppercase; tracking: 1px;">Order Number</span>
                        <p style="font-family: monospace; font-size: 16px; font-weight: bold; color: #1a202c; margin: 4px 0 0 0;">${payload.orderNumber}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 10px; font-weight: bold; color: #a0aec0; text-transform: uppercase; tracking: 1px;">Date Placed</span>
                        <p style="font-size: 14px; font-weight: 600; color: #2d3748; margin: 4px 0 0 0;">${formattedDate}</p>
                    </div>
                </div>

                <!-- Items Breakdown Summary Table layout metrics -->
                <h3 style="font-size: 12px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 8px;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <thead>
                        <tr style="background-color: #f7fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #4a5568; text-align: left; text-transform: uppercase;">Product Reference</th>
                            <th style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #4a5568; text-align: center; text-transform: uppercase; width: 80px;">Qty</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRowsHTML}
                    </tbody>
                </table>

                <!-- Financial Billing Block Matrix Summary line references -->
                <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #4a5568;">
                        <span>Grand Total (Incl. 2% Tax):</span>
                        <span style="font-weight: 800; color: #1a202c; font-size: 16px;">₹${payload.amount.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <!-- Shipping Address layout Block line display representation -->
                <h3 style="font-size: 12px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 6px;">Delivery Destination</h3>
                <div style="background-color: #fffaf8; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; font-size: 13px; color: #4a5568; white-space: pre-line; line-height: 1.6;">
                    ${payload.address}
                </div>

            </div>

            <!-- Email Footer Copyright tag area line info notation block link template -->
            <div style="background-color: #f7fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #a0aec0;">
                <p style="margin: 0;">This email is an automated receipt configuration. Do not reply directly.</p>
                <p style="margin: 4px 0 0 0;">&copy; 2026 Your Company. All rights reserved.</p>
            </div>

        </div>
    </body>
    </html>
    `;
}

const generateUniqueOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStamp = `${year}${month}${day}`;

    // Generate a 5-character random alphanumeric string
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();

    return `ORD-${dateStamp}-${randomChars}`;
};


export async function POST(request) {
 
    try {
        const auth = getAuth(request);
        const userId = auth?.userId; // Will be null or undefined if the user is a guest

        // 1. Destructure guestEmail alongside address and items from the incoming request body
        const { address, items, guestEmail } = await request.json();
        await connectDB();

        // 2. REPLACED UNAUTHORIZED CHECK: If there is no userId, they MUST provide a guest email
        if (!userId && !guestEmail) {
            return NextResponse.json({ success: false, message: "Email required for guest checkout" }, { status: 400 });
        }

        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
        }

        // 3. FIXED REDUCE BUG: Replaced async .reduce with a clean for...of loop
        let rawAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                rawAmount += product.price * item.quantity;
            }
        }
        const orderNumber = generateUniqueOrderNumber();
        // Apply 2% tax and use standard float rounding to prevent trailing JS math decimals
        const totalAmount = Math.round((rawAmount + (rawAmount * 0.02)) * 100) / 100;

        // 4. Send event data to Inngest, explicitly supplying guest configurations
        await inngest.send({
            name: "order/created",
            data: {
                orderNumber,
                userId: userId || null,   // Falls back to null so Mongoose knows it's a guest
                isGuest: !userId,        // Boolean flag for easy database indexing
                guestEmail: userId ? null : guestEmail,
                items,       
                amount: totalAmount, 
                address,
                date: Date.now(),
            }
        });

        // 5. HYBRID CART CLEARING: Only clear database carts for registered members
        if (userId) {
            const user = await User.findOne({ _id: userId });
            if (user) {
                user.cartItems = [];
                await user.save();
            }
        }

        // Inside your server-side POST handler route right after inngest.send():
        return NextResponse.json({ 
            success: true, 
            message: "Order Placed Successfully",
            orderNumber: orderNumber // 🌟 ENSURE THIS KEY MATCHES EXACTLY IN LOWERCASE/CAMELCASE 🌟
        }, { status: 201 });

        
    } catch (error) {
        console.log("Error creating order:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
