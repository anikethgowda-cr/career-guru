import mongoose from "mongoose"

const userProfileSchema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    education:{
        type: String,
        required:true
    },
    experience:{
        type: Number,
        required:true
    },
    skills:{
        type:[String],
        required:true
    },
    preferredJobRole:{
        type:String,
        required:true
    },
    preferredLocation:{
        type:String,
        required:true
    },
    linkedin:{
        type:String,
    },
    activeStreak: {
        type: Number,
        default: 1 // Default to 1 day for new users
    },
    xp: {
        type: Number,
        default: 20 // Default to 20 XP for new users
    }
})
const UserProfile = mongoose.model("UserProfile", userProfileSchema)

export default UserProfile