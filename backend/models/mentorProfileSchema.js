import mongoose from "mongoose"

const mentorProfileSchema=new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    designation:{
        type:String,
        required:true
    },
    company:{
        type:String,
        required:true
    },
    yearsOfExperience:{
        type: Number,
        min: 0
    },
    specialization:{
        type:String,
        required:true
    },
    bio:{
        type:String,
        required:true
    },
    hourlyRate:{
        type:Number,
        required:true
    },
    availableSlots: [{
        date: Date,
        startTime: String,
        endTime: String
    }],
    languages:{
        type:[String],
        required:true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalStudents: {
        type: Number,
        default: 0,
        min: 0
    }
})
const mentorProfile= mongoose.model("MentorProfile",mentorProfileSchema)

export default mentorProfile