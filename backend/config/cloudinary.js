

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Attach v2 reference so multer-storage-cloudinary can access cloudinary.v2.uploader
cloudinary.v2 = cloudinary;

export default cloudinary;