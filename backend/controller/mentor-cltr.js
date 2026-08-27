import User from "../models/userSchema.js"
import MentorProfile from "../models/mentorProfileSchema.js";
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

export const mentorRegister=async(req,res)=>{
    const{username,email,password,phone}=req.body
    
     try{
        const mentorExists =await User.findOne({email})
        if(mentorExists){
            return res.status(409).json({error:"mentor already registered"})
        }
        let saltValue=await bcryptjs.genSalt(10)
        let hashPassword=await bcryptjs.hash(password,saltValue)
        
        
        const user =await User.create({username,email,password:hashPassword,phone,role:"mentor"})
        res.status(201).json({data:user,message:"Sucessfully registed"})
    }catch(err){
        console.log(err)
        res.status(500).json({success:false,error:"Internal Server Error"})
    }
}

export const mentorLogin= async (req,res)=>{
    const {email,password}=req.body
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({error:"user not found"})
        }else if(user.role!=="mentor"){
            return res.status(409).json({error:"unauthorized acess"})
        }
        const isVerified= await bcryptjs.compare(password,user.password)
        if(!isVerified){
            return res.status(401).json({error:"invalid credentials"})
        }
        
        const tokenData={userId:user._id,role:user.role}
        const token=jwt.sign(tokenData,process.env.JWT_SECRET,{expiresIn:"7d"})
        res.status(200).json({data:token,message:{status:"sucess"}})

    }catch(err){
        console.log(err);
        res.status(500).json({success:false,error:"Internal Server Error"})
    }
}


export const deleteMentor = async (req, res) => {
    const userId = req.userId;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        return res.status(200).json({
            data: deletedUser,
            message: "User deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            success:false,
            error: "Internal Server Error"
        });
    }
};







export const createMentorProfile = async (req, res) => {
    try {
        const userId = req.userId;

        // Check if mentor profile already exists
        const existingProfile = await MentorProfile.findOne({ userId });

        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: "Mentor profile already exists"
            });
        }

        const {designation,company,yearsOfExperience,specialization,bio,hourlyRate,availableSlots,languages} = req.body;

        // Create mentor profile
        const mentorProfile = await MentorProfile.create({
            userId,
            designation,
            company,
            yearsOfExperience,
            specialization,
            bio,
            hourlyRate,
            availableSlots,
            languages
        });

        return res.status(201).json({
            success: true,
            message: "Mentor profile created successfully",
            data: mentorProfile
        });

    } catch (err) {
        console.error("Create mentor profile error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to create mentor profile",
            error: "Internal Server Error"
        });
    }
};

export const showMentorProfile= async(req,res)=>{
    let userId = req.userId
   try{
        const mentorDetails= await User.findById(userId)
        if(!mentorDetails){
            return res.status(404).json({error:"user not found"})
        }

        const ProfileDetails= await MentorProfile.findOne({userId})
        if(!ProfileDetails){
            return res.status(404).json({error:"No Profile Data Found"})
        }

        res.status(200).json({success:true,mentor:mentorDetails,profile:ProfileDetails})
   }catch(err){
        console.log(err)
        res.status(500).json({success:false,error:"Internal Server Error"})
   }
}
