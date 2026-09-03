import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    education: {
        type: String,
        required: true
    },

    experience: {
        type: String,
        required: true
    },

    preferredJobRole: {
        type: String,
        required: true
    },

    preferredSpecialization: {
        type: [String],
        required: true
    },

    preferredLocation: {
        type: String,
        required: true
    },

    linkedin: {
        type: String
    }
},{timestamps:true});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

export default UserProfile;