import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, required: true, enum: ["percentage", "fixed", "shipping"] },
    value: { type: Number, required: true, default: 0 }
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;
