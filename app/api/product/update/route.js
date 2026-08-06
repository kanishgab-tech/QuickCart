import { v2 as cloudinary } from 'cloudinary';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Product from '@/models/Product';


// Configure Cloudinary Credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();

    // 1. Native form parsing inside the execution scope
    const formData = await request.formData();

    // FIXED: Form fields extraction moved securely inside the function body
  const isActiveRaw = formData.get("isActive");
  // If 'isActive' is provided, parse it to a boolean; otherwise default to true
  const isActive = isActiveRaw !== null ? (isActiveRaw === "true" || isActiveRaw === true) : true;

    const isPopularRaw = formData.get("isPopular");
    const isPopular = isPopularRaw === "true" || isPopularRaw === true;

    const productId = formData.get("productId");
    const name = formData.get("name");
    const category = formData.get("category");
    const offerPrice = formData.get("offerPrice");
    const existingImagesRaw = formData.get("existingImages");
    const description = formData.get("description");
    const price = formData.get("price");

    if (!productId || !name || !category || !offerPrice|| !price) {
      return NextResponse.json(
        { success: false, message: "Missing required textual parameters." },
        { status: 400 }
      );
    }

    let finalImageUrls = [];
    if (existingImagesRaw) {
      finalImageUrls = JSON.parse(existingImagesRaw);
    }

    // 2. Stream new assets to Cloudinary storage buckets
    const fileEntries = formData.getAll("newImages");

    for (const file of fileEntries) {
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "product_images",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });

        if (uploadResult && uploadResult.secure_url) {
          finalImageUrls.push(uploadResult.secure_url);
        }
      }
    }

    if (finalImageUrls.length === 0) {
      return NextResponse.json(
        { success: false, message: "A product must contain at least one valid image." },
        { status: 400 }
      );
    }

    // 3. Persist document modifications into MongoDB collections
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        category,
        description,                
        price: parseFloat(price),   
        offerPrice: parseFloat(offerPrice),
        image: finalImageUrls,
        isPopular, 
        isActive,
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Target product record not found in database tracking systems." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product and media references successfully synchronized!",
      product: updatedProduct
    }, { status: 200 });

  } catch (error) {
    console.error("Cloudinary/Database Update Route Pipeline Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
