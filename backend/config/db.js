import mongoose from "mongoose";

const configureDb=async()=>{
    try{
        const db=await mongoose.connect(process.env.DB_URL)
        console.log("DataBase is connected to",db.connection.name);
    } catch (error) {
        console.error("Error connecting to database:", error);
    }
}
export default configureDb;

