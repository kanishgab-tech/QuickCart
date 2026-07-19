import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id:{type : string, required:true},
    name: {type : string, required:true},
    email: {type : string, required:true, unique: true},
    imageurl: {type : string, required:true},
    cartItems: {type : Object, default:{}}
}, {minimize:false}
)

const User= mongoose.model.User || mongoose.model('user',userSchema)

export default User 