import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "mentor", "user"],
        default: "user"
    },
    phone: {
        type: Number,
        default: ""
    },
    
    isVerified:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

export default User
