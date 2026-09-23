import express from "express"
import authenticateUser from "../middleware/authentication.js"
import authorizeRoles from "../middleware/authorizeRoles.js"
import { userRegister, userLogin, showProfile, deleteUser, createProfile, getCurrentUser, updateProfile } from "../controller/user-cltr.js"

const userRouter = express.Router()

userRouter.post("/user/register", userRegister)
userRouter.post("/user/login", userLogin)
userRouter.get("/user/me", authenticateUser, getCurrentUser)
userRouter.delete("/user/delete", authenticateUser, authorizeRoles("user"), deleteUser)

//------------------------------------------------------------------------
userRouter.post("/user/profile", authenticateUser, authorizeRoles("user"), createProfile)
userRouter.get("/user/profile", authenticateUser, authorizeRoles("user"), showProfile)
userRouter.put("/user/profile", authenticateUser, authorizeRoles("user"), updateProfile)

export default userRouter
