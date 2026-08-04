// inngest/client.ts
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";
import { connect } from "mongoose";
import nodemailer from "nodemailer";

export const inngest = new Inngest({ id: "kansan-next" });

// Initialize a standard SMTP tunnel directly through Google
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


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
          // Inside your loop context:
            if (targetEmail) {n
                try {
                    await transporter.sendMail({
                        from: `"KanSan Orders" <${process.env.EMAIL_USER}>`,
                        to: targetEmail.trim(), // Can now deliver to ANY email address!
                        subject: `Order Confirmation - ${payload.orderNumber}`,
                        html: generateInvoiceHTML(payload, orderPayload.date)
                    });
                    console.log(`Invoice emailed safely via Gmail SMTP to: ${targetEmail}`);
                } catch (emailError) {
                    console.error("Nodemailer routing crash:", emailError);
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


//Inngest function to save user data to a database

export const syncUserCreation = inngest.createFunction(
    {
        id:'sync-user-from-clerk',
        triggers:[{event:'clerk/user.created'}]
    },
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id:id,
            email:email_addresses[0].email_address||'',
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            imageUrl: image_url
        }
        await connectDB()
        await User.create(userData)
    }
)

export const syncUserUpdate = inngest.createFunction(
    {
        id:'update-user-from-clerk',
        triggers:[{event: 'clerk/user.updated'}],
        
    onFailure: async ({ error, event, step }) => {
  // 1. Log the error to your monitoring system
  await step.run("capture-sentry-error", async () => {
    Sentry.captureException(error, { extra: { event } });
  });

  // 2. Send an alert via Slack
  await step.run("send-slack-alert", async () => {
    await slack.chat.postMessage({
      channel: "#alerts",
      text: `🚨 Task *${event.name}* failed after maximum retries.\nError: \`${error.message}\``
    });
  });

  // 3. Notify the user/admin via Email
  await step.run("send-email-notification", async () => {
    await resend.emails.send({
      from: "kanishga.b@gmail.com",
      to: "kanishga.b@gmail.com",
      subject: `Task Failed: ${event.name}`,
      text: `The function execution failed for event ${event.id}. Reason: ${error.message}`
    });
  });
},

    },
    async ({event}) => {
        const { id, first_name, last_name, email_addresses, image_url} = event.data
        const userData = {
            _id:id,
            email:email_addresses[0].email_address||'',
            name: `${first_name || ''} ${last_name || ''}`.trim(),
            imageUrl: image_url
        }
        await connectDB()
        await User.findByIdAndUpdate(id,userData, { upsert: true })
    }
)

export const syncUserDeletion = inngest.createFunction(
    {
        id:'delete-user-from-clerk',
        triggers:[{event: 'clerk/user.deleted'}]
    },
    async ({event}) => {

        const { id } = event.data
                
        await connectDB()
        await User.findByIdAndDelete(id)
    }
)

//ingest function to create user's order in database 
/*
export const createUserOrder = inngest.createFunction(
    { 
        id:'create-user-order',
        triggers:[{event: 'order/created'}],
        batchEvents: {
            maxSize: 5,
            timeOut: '5s' // 5 seconds
        }
    },
    async ({events}) => {
        const eventList = events || [];
        const orders = eventList.map((singleEvent) => {
            const payload = singleEvent.data|| singleEvent;

            return {
                orderNumber: payload.orderNumber,
                userId: payload.userId,
                isGuest: payload.isGuest,
                guestEmail: payload.guestEmail || null,
                items:  payload.items,
                amount: payload.amount,
                address: payload.address,
                date: payload.date || Date.now() 
            }

        })
        
        //  to see exactly what Mongoose is about to insert
        //  console.log("Processed orders array for DB insertion:", JSON.stringify(orders, null, 2));

        // Safe debugging log to check your array before saving to MongoDB
    
        console.log("Processed orders array for DB insertion:", JSON.stringify(orders, null, 2));

        // 3. Proper array length check
        if (orders.length === 0) {
        return { success: false, message: "No valid orders found in this batch slice" };
        }
    
        await connectDB()
        await Order.insertMany(orders)  
        return { success: true, processed: orders.length };
    }
)*/
