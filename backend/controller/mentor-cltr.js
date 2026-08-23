import User from "../models/userSchema.js"
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
        const countUsers = await User.countDocuments();
        
        const user =await User.create({username,email,password:hashPassword,phone,role:"mentor"})
        res.status(201).json({data:user,message:"Sucessfully registed"})
    }catch(err){
        console.log(err)
        res.status(500).json({error:"Something went wrong"})
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
        res.status(500).json({error:"Somthing went wrong"})
    }
}

export const mentorProfile= async(req,res)=>{
    let userId = req.userId
   try{
        const userDetails= await User.findById(userId)
        if(!userDetails){
            return res.status(404).json({error:"user not found"})
        }
        res.status(200).json({Data:userDetails})
   }catch(err){
        console.log(err)
        res.status(500).json({error:"something went wrong"})
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
            error: "Something went wrong"
        });
    }
};