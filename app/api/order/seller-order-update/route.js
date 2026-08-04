import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Adjust the path to your database connector
import Order from "@/models/Order";     // Adjust the path to your Mongoose Order model

export async function POST(request) {
    try {
        // 1. Establish database connection pool
        await connectDB();

        // 2. Extract input payload tracking keys
        const body = await request.json();
        const { orderId, status } = body;

        // Basic structural parameter safety validation
        if (!orderId || !status) {
            return NextResponse.json(
                { success: false, message: "Missing required orderId or status parameter." },
                { status: 400 }
            );
        }

        const validStatuses = ["Order Placed", "Payment Pending", "Shipped", "Delivered", "Cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, message: "Invalid status value provided." },
                { status: 400 }
            );
        }

        // 3. Execute the atomic MongoDB update operation matching your schema parameters
        // using { new: true } to return the document after updates take effect
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return NextResponse.json(
                { success: false, message: "Target order record not found in database tracks." },
                { status: 404 }
            );
        }

        // 4. Return clean json confirmation status
        return NextResponse.json({
            success: true,
            message: "Database status state synced successfully!",
            order: updatedOrder
        }, { status: 200 });

    } catch (error) {
        console.error("Database update error stack trace:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error occurred." },
            { status: 500 }
        );
    }
}
