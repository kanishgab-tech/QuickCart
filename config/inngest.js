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
        batchEvents: { maxSize: 5, timeout: '5s' } 
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
                status: payload.status,
                notes: payload.notes,
                shippingCharges: payload.shippingCharges,
                discountAmount: payload.discountAmount,
                couponCode: payload.couponCode,
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
                // 1. FIXED VALUE INITIALIZATION: Tracks raw subtotal of items
                let itemsSubtotal = 0; 

                for (const item of payload.items) {
                    const productDoc = await Product.findById(item.product);
                    const itemPrice = productDoc ? (productDoc.offerPrice || productDoc.price) : 0;
                    
                    // Increment the subtotal accumulation loop
                    itemsSubtotal += (itemPrice * item.quantity);

                    enrichedItems.push({
                        name: productDoc ? productDoc.name : "Purchased Item",
                        description: productDoc ? productDoc.description : "No description available.",
                        quantity: item.quantity,
                        price: itemPrice,
                    });
                }

                // 2. FIXED FUNCTION CALL: Appended itemsSubtotal into the parameter footprint
                const htmlContent = generateInvoiceHTML(
                    payload.orderNumber,
                    payload.amount,
                    payload.address,
                    orderPayload.date,
                    enrichedItems,
                    payload.shippingCharges,
                    payload.discountAmount,
                    payload.couponCode,
                    payload.tax,
                    itemsSubtotal 
                );

                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
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
// 3. UPDATED PARAMETERS: Injected itemsSubtotal parameter to handle dynamic display
function generateInvoiceHTML(orderNumber, totalAmount, deliveryAddress, orderDate, itemsList, shippingCharges, discountAmount, couponCode, tax, itemsSubtotal) {
    const formattedDate = new Date(orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
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
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
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
                            <span style="font-size: 10px; font-weight: bold; color: #a0aec0; text-transform: uppercase; letter-spacing: 1px;">Order Number</span>
                            <p style="font-family: monospace; font-size: 15px; font-weight: bold; color: #1a202c; margin: 4px 0 0 0;">${orderNumber}</p>
                        </td>
                        <td style="padding: 0; text-align: right; vertical-align: top;">
                            <span style="font-size: 10px; font-weight: bold; color: #a0aec0; text-transform: uppercase; letter-spacing: 1px;">Date Placed</span>
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
                    <table style="width: 100%; border-collapse: collapse;">
                        <!-- Render the Items Subtotal row clearly at the top of pricing stacks -->
                        <tr>
                            <td style="font-size: 13px; color: #4a5568; font-weight: 500; padding: 4px 0;">Items Subtotal:</td>
                            <td style="font-weight: 700; color: #1a202c; font-size: 15px; text-align: right; padding: 4px 0;">₹${(itemsSubtotal || 0).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td style="font-size: 13px; color: #4a5568; font-weight: 500; padding: 4px 0;">Shipping Charges:</td>
                            <td style="font-weight: 600; color: #262e3d; font-size: 15px; text-align: right; padding: 4px 0;">₹${shippingCharges.toLocaleString('en-IN')}</td>
                        </tr>
                        
                        <!-- FIXED CONDITION: Omit Discount row completely if it is zero or empty -->
                        ${discountAmount && Number(discountAmount) > 0 ? `
                        <tr>
                            <td style="font-size: 13px; color: #4a5568; font-weight: 500; padding: 4px 0;">Discount Amount ${couponCode ? `(${couponCode})` : ''}:</td>
                            <td style="font-weight: 600; color: #16a34a; font-size: 15px; text-align: right; padding: 4px 0;">-₹${Number(discountAmount).toLocaleString('en-IN')}</td>
                        </tr>
                        ` : ''}

                        <!-- FIXED CONDITION: Omit Tax row completely if it is zero, empty, or un-evaluated -->
                        ${tax && Number(tax) > 0 ? `
                        <tr>
                            <td style="font-size: 13px; color: #4a5568; font-weight: 500; padding: 4px 0;">Tax Amount (3%):</td>
                            <td style="font-weight: 600; color: #242d3d; font-size: 15px; text-align: right; padding: 4px 0;">₹${Number(tax).toLocaleString('en-IN')}</td>
                        </tr>
                        ` : ''}

                        <tr style="border-top: 1px solid #e2e8f0;">
                            <td style="font-size: 14px; color: #1a202c; font-weight: bold; padding-top: 10px;">Grand Total:</td>
                            <td style="font-weight: 800; color: #ea580c; font-size: 20px; text-align: right; padding-top: 10px;">₹${totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>

                <!-- Multiline Delivery Destination Box -->
                <h3 style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Delivery Destination</h3>
                <div style="background-color: #fffaf8; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px; font-size: 13px; color: #4a5568; white-space: pre-line; line-height: 1.6; width: 100%; box-sizing: border-box; margin-bottom: 24px;">
                    ${deliveryAddress}
                </div>

                <!-- NEW ADDITION: OFFICIAL BANKING & UPI PAYMENT CREDENTIALS RECEPTACLE BOX -->
                <h3 style="font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">Official Payment Instructions</h3>
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; font-size: 13px; color: #334155; width: 100%; box-sizing: border-box; margin-bottom: 8px;">
                    <div style="font-weight: bold; color: #0f172a; margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                        🏦 Direct Bank Wire Details
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Account Holder:</td>
                            <td style="padding: 4px 0; color: #0f172a; font-weight: bold; text-align: right;">QUICKCART RETAILS PVT LTD</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Account Number:</td>
                            <td style="padding: 4px 0; color: #0f172a; font-family: monospace; font-weight: bold; text-align: right; letter-spacing: 0.5px;">924020054781632</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-weight: 500;">Bank IFSC Code:</td>
                            <td style="padding: 4px 0; color: #ea580c; font-family: monospace; font-weight: bold; text-align: right; uppercase; text-transform: uppercase;">UTIB0000290</td>
                        </tr>
                    </table>

                    <div style="font-weight: bold; color: #0f172a; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 4px;">
                        📲 Smart Phone App Transfer (UPI / GPay / BHIM)
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.5;">
                        To pay via smartphone apps, initiate a transfer to our verified corporate merchant identifier below and input your exact bill of <strong style="color: #ea580c; font-size: 14px;">₹${totalAmount.toLocaleString('en-IN')}</strong>:
                    </p>
                    <div style="background-color: #ffffff; border: 1px dashed #ea580c; padding: 10px; text-align: center; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: bold; color: #ea580c; margin: 12px 0; letter-spacing: 0.5px;">
                        KanSanCrackers@axisbank
                    </div>
                    
                    <div style="background-color: #fff7ed; border-left: 3px solid #f97316; padding: 10px; font-size: 11px; color: #9a3412; border-radius: 4px; line-height: 1.4; margin-top: 12px; font-weight: 500;">
                        💡<strong>Fulfillment Notice:</strong> Once your transfer processes successfully, please capture a screenshot of the receipt panel and upload it through your customer account order dashboard to expedite verification.
                    </div>
                </div>

            </div>
            
            <div style="background-color: #f7fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 11px; color: #a0aec0; width: 100%; box-sizing: border-box;">
                <p style="margin: 0;">This email is an automated receipt. Do not reply directly to this thread.</p>
                <p style="margin: 4px 0 0 0;">&copy; 2026 KanSan Crackers. All rights reserved.</p>
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

export const orderUpdatedNotification = inngest.createFunction(
  { 
    id: "order-updated-email-notice" ,
    triggers:[{event: "order/updated" }]
   }, // Listens explicitly to the event token pushed from our edit modal API
  async ({ event, step }) => {
    const { orderNumber, customerEmail, address, amount, items, notes } = event.data;

    if (!customerEmail) return { message: "Skipped. Customer email contact parameters absent." };

    // Compile an attractive HTML layout detailing changes for the buyer
    await step.run("send-update-email", async () => {
      await resend.emails.send({
        from: "QuickCart Updates <kanishga.b@gmail.com>",
        to: [customerEmail],
        subject: `⚠️ Order Update Notification: ${orderNumber}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #ea580c; border-b: 2px solid #f3f4f6; padding-bottom: 8px;">Your Order Has Been Updated</h2>
            <p style="font-size: 14px;">Hello,</p>
            <p style="font-size: 14px; line-height: 1.5;">
              This notification is to confirm that administrative changes were recently made to your order <strong>${orderNumber}</strong> based on your customer request.
            </p>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h4 style="margin-top: 0; text-transform: uppercase; font-size: 11px; color: #9ca3af; tracking: 0.5px;">Updated Shipping Destination</h4>
              <p style="font-size: 13px; font-weight: bold; white-space: pre-line; margin: 0; color: #111827;">${address}</p>
            </div>

            <h4 style="text-transform: uppercase; font-size: 11px; color: #9ca3af; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px;">Updated Items List</h4>
            <ul style="list-style: none; padding-left: 0; font-size: 13px; color: #4b5563;">
              ${items.map(item => `
                <li style="padding: 6px 0; border-bottom: 1px dashed #f3f4f6; display: flex; justify-content: space-between;">
                  <strong>${item.name}</strong> <span style="color: #ea580c; font-weight: bold;">x ${item.quantity}</span>
                </li>
              `).join('')}
            </ul>

            <div style="margin-top: 20px; text-align: right; border-top: 2px solid #f3f4f6; padding-top: 12px;">
              <span style="font-size: 13px; font-weight: bold; color: #4b5563;">Revised Total Amount Due:</span>
              <p style="font-size: 20px; font-weight: 900; color: #ea580c; margin: 4px 0 0 0;">₹${amount.toLocaleString('en-IN')}</p>
            </div>

            ${notes ? `
              <div style="margin-top: 16px; font-size: 11px; color: #6b7280; font-style: italic; background-color: #fff7ed; border-left: 3px solid #f97316; padding: 8px 12px;">
                <strong>Seller Logistics Note:</strong> ${notes}
              </div>
            ` : ''}

            <p style="font-size: 11px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 12px; text-align: center;">
              Thank you for shopping with us. This is an automated transaction tracking log statement.
            </p>
          </div>
        `
      });
    });

    return { success: true, message: `Notification email successfully streamed to ${customerEmail}` };
  }
);

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
