import mongoose from 'mongoose'; // Fixed import format to prevent Next.js hot-reload warnings

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: false, ref: 'User', default: null },
    orderNumber: {type: String,  required: true, unique: true },
    isGuest: { type: Boolean, required: true, default: false },
    guestEmail: { type: String, required: false, default: null },
    items: [{
        product: { type: String, required: true, ref: 'Product' },
        quantity: { type: Number, required: true }
    }],
    amount: { type: Number, required: true },
    address: { type: String, ref: 'Address', required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    date: { type: Number, required: true }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
