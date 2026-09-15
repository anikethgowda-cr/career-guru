import multer from "multer";

const storage = multer.memoryStorage();

const assessmentUpload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

export default assessmentUpload;