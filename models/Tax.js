import mongoose from "mongoose";

const taxSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g. "TAX1", "TAX2"
    type: { type: String, required: true },  // e.g. "GST", "GEN"
    value: { type: Number, required: true, default: 0 } // Percentage value (e.g. 5, 2)
});

const Tax = mongoose.models.Tax || mongoose.model("Tax", taxSchema);
export default Tax;
