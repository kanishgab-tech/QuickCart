import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
    try {
        // 1. Extract contact data passed from your UI form submission
        const {firstName,lastName,email,mobile, message } = await req.json();

        // Validate basic inputs
        if (!firstName || !email || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Configure the Gmail Nodemailer transporter using your App Password
         const transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 465,       // Port for secure SSL
                            secure: true,    // Use SSL natively
                            auth: {
                                user: process.env.EMAIL_USER, 
                                pass: process.env.EMAIL_PASS  
                            }
                        });

        
        // 3. Compose the email payload sent to the seller
        const mailOptions = {
            from: `"${firstName}" <${process.env.GMAIL_USER}>`, // Sent via your authenticated gmail account
            to: process.env.SELLER_EMAIL,                 // The seller's inbox address
            replyTo: email,                               // Allows the seller to hit reply directly to the customer
            subject: `New Customer Enquiry from ${firstName}`,
            text: `You have received a new message from your store contact form:\n\n` +
                  `Name: ${firstName}\n` +
                  `Email: ${email}\n\n` +
                  `Message:\n${message}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>New Store Enquiry</h2>
                    <p><strong>Name:</strong> ${firstName}, ${lastName}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <p><strong>Mobile:</strong> <a href="mailto:${email}">${mobile}</a></p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-left: 4px solid #0070f3;">${message}</p>
                </div>
            `,
        };

        // 4. Fire the email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "Enquiry email sent successfully!" }, { status: 200 });

    } catch (error) {
        console.error("Email API Route Error:", error);
        return NextResponse.json({ error: "Failed to send email notification" }, { status: 500 });
    }
}
