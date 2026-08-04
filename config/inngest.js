// inngest/client.ts
import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";
import { connect } from "mongoose";
import nodemailer from "nodemailer";
import Product from "@/models/Product";


export const inngest = new Inngest({ id: "kansan-next" });

export const createUserOrder = inngest.createFunction(
    { 
        id: 'create-user-order',
        triggers: [{ event: 'order/created' }],
        batchEvents: {
            maxSize: 5,
            timeout: '5s'
        }
    },
    async ({ events, step }) => {
        const eventList = events || [];
        const processedOrders = [];
        
        await connectDB();

        for (const singleEvent of eventList) {
            const payload = singleEvent.data || singleEvent;

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

            await step.run("send-invoice-email", async () => {
                let targetEmail = payload.guestEmail;

                if (!payload.isGuest && payload.userId) {
                    const databaseUser = await User.findById(payload.userId);
                    if (databaseUser && databaseUser.email) {
                        targetEmail = databaseUser.email;
                    }
                }

                console.log(`INNGEST DEBUG -> User check: [${process.env.EMAIL_USER ? 'FOUND' : 'MISSING'}]`);

                if (!targetEmail) {
                    return { skipped: true, reason: "No recipient address found" };
                }

                const enrichedItems = [];
                for (const item of payload.items) {
                    const productDoc = await Product.findById(item.product);
                    enrichedItems.push({
                        name: productDoc ? productDoc.name : "Purchased Item",
                        description: productDoc ? productDoc.description : "No description available.",
                        quantity: item.quantity,
                        price: productDoc ? (productDoc.offerPrice || productDoc.price) : 0
                    });
                }

                const htmlContent = generateInvoiceHTML(
                    payload.orderNumber, 
                    payload.amount, 
                    payload.address,
                    orderPayload.date,
                    enrichedItems);

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,       // Port for secure SSL
                    secure: true,    // Use SSL natively
                    auth: {
                        user: process.env.EMAIL_USER, 
                        pass: process.env.EMAIL_PASS  
                    }
                });


                const info = await transporter.sendMail({
                    from: `"KanSan Crakers Orders" <${process.env.EMAIL_USER}>`,
                    to: targetEmail.trim(), 
                    subject: `Order Confirmation - ${payload.orderNumber}`,
                    html: htmlContent 
                });

                return { success: true, messageId: info.messageId };
            });
        }
        
        if (processedOrders.length === 0) {
            return { success: false, message: "No valid orders found in this batch slice" };
        }
    
        await step.run("save-orders-to-db", async () => {
            await Order.insertMany(processedOrders);  
        });

        return { success: true, processed: processedOrders.length };
    }
);

// --- PROFESSIONAL CLEAN HTML INVOICE LAYOUT TEMPLATE ---
function generateInvoiceHTML(orderNumber, totalAmount, deliveryAddress, orderDate, itemsList) {
    const formattedDate = new Date(orderDate).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
        
        const itemRowsHTML = itemsList.map(item => `
        <tr style="border-bottom: 1px solid #edf2f7;">
            <td style="padding: 16px 12px; text-align: left; vertical-align: top;">
                <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1a202c;">${item.name}</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #718096; line-height: 1.4; max-width: 340px;">${item.description}</p>
            </td>
            <td style="padding: 16px 12px; font-size: 14px; color: #4a5568; text-align: center; vertical-align: top; font-weight: 600;">
                ${item.quantity}
            </td>
            <td style="padding: 16px 12px; font-size: 14px; color: #1a202c; text-align: right; vertical-align: top; font-weight: bold; width: 90px;">
                ₹${(item.price * item.quantity).toLocaleString('en-IN')}
            </td>
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
            
            <!-- Banner Section -->
            <div style="background-color: #ea580c; padding: 32px 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Order Confirmed!</h1>
                <p style="color: #ffedd5; margin: 8px 0 0 0; font-size: 14px;">Your order has been logged and is preparing for fulfillment.</p>
            </div>

            <!-- Receipt Meta Details -->
            <div style="padding: 24px;">
                <table style="width: 100%; margin-bottom: 24px;">
                    <tr>
                        <td style="padding: 0; text-align: left;">
                            <span style="font-size: 10px; font-weight: bold; color: #a0aec0; text-transform: uppercase; tracking-width: 1px;">Order Number</span>
                            <p style="font-family: monospace; font-size: 15px; font-weight: bold; color: #1a202c; margin: 4px 0 0 0;">${orderNumber}</p>
                        </td>
                        <td style="padding: 0; text-align: right; vertical-align: top;">
                            <span style="font-size: 10px; font-weight: bold; color: #a0aec0; text-transform: uppercase; tracking-width: 1px;">Date Placed</span>
                            <p style="font-size: 14px; font-weight: 600; color: #2d3748; margin: 4px 0 0 0;">${formattedDate}</p>
                        </td>
                    </tr>
                </table>

                <!-- Items Grid Breakdown Table Section -->
                <h3 style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px;">Items Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <thead>
                        <tr style="background-color: #f7fafc; border-bottom: 2px solid #e2e8f0;">
                            <th style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #4a5568; text-align: left; text-transform: uppercase;">Product Details</th>
                            <th style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #4a5568; text-align: center; text-transform: uppercase; width: 60px;">Qty</th>
                            <th style="padding: 10px 12px; font-size: 11px; font-weight: bold; color: #4a5568; text-align: right; text-transform: uppercase; width: 90px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRowsHTML}
                    </tbody>
                </table>

                <!-- Grand Summary pricing tier component -->
                <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="font-size: 14px; color: #4a5568; font-weight: 500;">Grand Total (Incl. 2% Delivery Tax):</td>
                            <td style="font-weight: 900; color: #1a202c; font-size: 18px; text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>

                <!-- Multiline Delivery Destination Box -->
                <h3 style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Delivery Destination</h3>
                <div style="background-color: #fffaf8; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; font-size: 13px; color: #4a5568; white-space: pre-line; line-height: 1.6;">
                    ${deliveryAddress}
                </div>
            </div>
            <div style="background-color: #f7fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #a0aec0;">
                <p style="margin: 0;">This email is an automated receipt. Do not reply directly to this thread.</p>
                <p style="margin: 4px 0 0 0;">&copy; 2026 QuickCart. All rights reserved.</p>
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
