import mongoose from "mongoose"

const conversationSchema=new mongoose.Schema(
    {
        student:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        mentor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },{
        timestamps:true
    }
)
const Conversation = mongoose.model("Conversation",conversationSchema)
export default Conversation