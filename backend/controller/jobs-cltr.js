import axios from "axios";
import UserProfile from "../models/userProfileSchema.js";

export const getJobsLinks = async (req, res) => {
    try {
        const userId = req.userId
        const userProfile = await UserProfile.findOne({ userId });

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            })
        }

        const role = userProfile.preferredJobRole;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: "No preferred job role found"
            })
        }

        const response = await axios.get(
            "https://api.adzuna.com/v1/api/jobs/in/search/1",
            {
                params: {
                    app_id: process.env.ADZUNA_APP_ID,
                    app_key: process.env.ADZUNA_APP_KEY,
                    what: role,
                    results_per_page: 18
                }
            }
        )
        
        return res.status(200).json({
            success: true,
            role,
            jobs: response.data.results
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}