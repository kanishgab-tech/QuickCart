import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Tax from "@/models/Tax";
import { inngest } from "@/config/inngest"; // NEW: Import your Inngest event system pipeline

export async function POST(request) {
    try {
        const auth = getAuth(request);
        const userId = auth?.userId;

        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
        }

        const body = await request.json();
        const { orderId, address, items, notes } = body;

        if (!orderId || !address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Missing parameter details." }, { status: 400 });
        }

        await connectDB();

        // [Keep your existing product lookup, discount checks, shipping rules, and tax matrix math loops identical]
        let newSubtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.product._id || item.product);
            if (product) newSubtotal += product.offerPrice * item.quantity;
        }

        const originalOrder = await Order.findById(orderId);
        if (!originalOrder) {
            return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
        }

        let newDiscount = originalOrder.discountAmount;
        const newShipping = newSubtotal >= 2000 || originalOrder.couponCode === "FREESHIP" ? 0 : 150;

        const dbTaxComponents = await Tax.find({});
        const taxableBasis = Math.max(0, newSubtotal - newDiscount);
        let newTotalTax = 0;
        dbTaxComponents.forEach((taxRule) => { newTotalTax += (taxableBasis * taxRule.value) / 100; });
        newTotalTax = Math.round(newTotalTax * 100) / 100;

        const newGrandTotal = Math.max(0, (newSubtotal + newShipping + newTotalTax) - newDiscount);

        // 1. Persist the updated configuration records to MongoDB
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
        ).populate('items.product'); // Populate product fields to gather true text string names for emails

        // 2. FIXED NEW DISPATCHER TRIGGER: Stream a background event message to the Inngest engine queue
        await inngest.send({
            name: "order/updated",
            data: {
                orderNumber: originalOrder.orderNumber,
                isGuest: originalOrder.isGuest,
                // Automatically directs to the logged-in user email or fallback guest contact email address string
                customerEmail: originalOrder.isGuest ? originalOrder.guestEmail : originalOrder.customerEmail, 
                address: updatedOrder.address,
                amount: updatedOrder.amount,
                shippingCharges: updatedOrder.shippingCharges,
                discountAmount: updatedOrder.discountAmount,
                tax: updatedOrder.tax,
                notes: updatedOrder.notes,
                items: updatedOrder.items.map(item => ({
                    name: item.product?.name || "Product Item",
                    quantity: item.quantity
                }))
            }
        });

        return NextResponse.json({
            success: true,
            message: "Order details updated and notification queued successfully!",
            order: updatedOrder
        }, { status: 200 });

    } catch (error) {
        console.error("Order Details Modification Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
