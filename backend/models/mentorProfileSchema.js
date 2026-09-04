import mongoose from "mongoose";

const mentorProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        education: {
            type: String,
            required: true
        },

        workType: {
            type: String,
            enum: ["employee", "self-employed", "freelancer"],
            required: true
        },

        experience: {
            type: Number,
            required: true,
            min: 0
        },

        expertIn: {
            type: [String],
            required: true
        },

        specialization: {
            type: [String],
            required: true
        },

        bio: {
            type: String,
            required: true
        },

        languages: {
            type: [String],
            required: true
        },

        organization: {
            type: String
        },

        designation: {
            type: String,
            required: true
        },

        origin: {
            type: String
        }
    }, { timestamps: true }
);

const MentorProfile = mongoose.model( "MentorProfile", mentorProfileSchema);

export default MentorProfile;