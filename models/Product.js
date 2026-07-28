import mangooese from "mongoose";

const productSchema = new mangooese.Schema({
    userId: { type: String, required: true , ref: 'User'},
    name  : { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    date: { type: Number, required: true }
})

const Product = mangooese.models.Product || mangooese.model('Product', productSchema)

export default Product