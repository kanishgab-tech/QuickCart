import { v2 as cloudinary } from 'cloudinary';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/config/db';
import Product from '@/models/Product';

/*cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
 // secure: true,
});*/

export async function POST(request) {

  cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
 // secure: true,
});

  try {
    const auth = getAuth(request);
    const userId = auth?.userId;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const isSeller = user?.publicMetadata?.role === 'seller';

    if (!isSeller) {
      return NextResponse.json({ success: false, message: 'Not a seller!!' }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const category = formData.get('category');
    const files = formData.getAll('images').filter(Boolean);
    const offerPrice = formData.get('offerPrice');
   

    if (!files.length) {
      return NextResponse.json({ success: false, message: 'Please upload at least one image' }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ success: false, message: 'Image upload is not configured' }, { status: 500 });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto' },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.end(buffer);
        });
      })
    );

    const image = results.map((result) => result.secure_url);
    await connectDB();

    const newProduct = await Product.create({
      userId,
      name,
      description,
      price: Number(price),
      offerPrice: Number(offerPrice),
      image,
      category,
      date: Date.now(),
    });

    return NextResponse.json(
      { success: true, message: 'Product added successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Unable to add product' }
      //{ status: 500 }
    );
  }
}