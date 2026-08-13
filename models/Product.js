import mangooese from "mongoose";

const productSchema = new mangooese.Schema({
    userId: { type: String, required: true , ref: 'User'},
    name  : { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    date: { type: Number, required: true },
    isActive: { type: Boolean, required: true, default: true },
    isPopular: { type: Boolean, required: true, default: false },
    stock: { type: Number, required: true, min: 0, default: 0 } 
})

const Product = mangooese.models.Product || mangooese.model('Product', productSchema)

export default Product