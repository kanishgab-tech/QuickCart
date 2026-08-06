import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import  connectDB  from "@/config/db"; 
import Product from "@/models/Product";   
import Order from "@/models/Order";       

// Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicIdFromUrl = (url) => {
  try {
    if (!url || !url.includes("cloudinary.com")) return null;
    const parts = url.split("/");
    const filenameWithExtension = parts[parts.length - 1];
    const filename = filenameWithExtension.split(".")[0];
    return `product_images/${filename}`;
  } catch (error) {
    return null;
  }
};

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { productId, action } = body; // action: 'deactivate' or 'hard-delete'

    if (!productId || !action) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: productId and action." },
        { status: 400 }
      );
    }

    // 1. GUARDIANSHIP CHECK: Block if bound to any active orders
    const activeOrderWithProduct = await Order.findOne({
      "items.product": productId,
      status: { $in: ["Order Placed", "Payment Pending", "Shipped"] }
    });

    if (activeOrderWithProduct) {
      return NextResponse.json({
        success: false,
        message: `Operation blocked. This item is bound to an active order (${activeOrderWithProduct.status}) currently under fulfillment.`
      }, { status: 400 });
    }

    // 2. SOFT-DELETE (DEACTIVATE) PIPELINE BRANCH
    if (action === "deactivate") {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { isActive: false },
        { new: true }
      );

      if (!updatedProduct) {
        return NextResponse.json({ success: false, message: "Product record not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: "Product soft-deleted successfully! It is now hidden from the storefront shopping layout grids."
      });
    }

    // 3. HARD-DELETE (PERMANENT PURGE) PIPELINE BRANCH
    if (action === "hard-delete") {
      const productToDelete = await Product.findById(productId);
      if (!productToDelete) {
        return NextResponse.json({ success: false, message: "Product record not found." }, { status: 404 });
      }

      // Purge assets from Cloudinary media storage buckets completely
      if (productToDelete.image && productToDelete.image.length > 0) {
        const deletionPromises = productToDelete.image.map((imageUrl) => {
          const publicId = getPublicIdFromUrl(imageUrl);
          if (publicId) return cloudinary.uploader.destroy(publicId);
          return Promise.resolve(null);
        });
        await Promise.all(deletionPromises);
      }

      // Permanently remove document array parameters from MongoDB collections 
      await Product.findByIdAndDelete(productId);

      return NextResponse.json({
        success: true,
        message: "Product record and matching Cloudinary cloud storage files completely wiped!"
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action pattern specified." }, { status: 400 });

  } catch (error) {
    console.error("Backend Deletion Endpoint Pipeline Failure:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
