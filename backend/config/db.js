import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const configureDb=async()=>{
    try{
        const db=await mongoose.connect(process.env.DB_URL)
        console.log("DataBase is connected to",db.connection.name);
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1);
    }
}
export default configureDb;

