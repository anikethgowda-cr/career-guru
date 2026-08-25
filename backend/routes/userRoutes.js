import express from "express"
import authenticateUser from "../middleware/authentication.js"
import { userRegister,userLogin,showProfile,deleteUser,createProfile } from "../controller/user-cltr.js"


const userRouter = express.Router() 



userRouter.post("/user/register",userRegister)
userRouter.post("/user/login",userLogin)
userRouter.delete("/user/delete",authenticateUser,deleteUser)
//------------------------------------------------------------------------
userRouter.post("/user/profile",authenticateUser,createProfile)
userRouter.get("/user/profile",authenticateUser,showProfile)



export default userRouter