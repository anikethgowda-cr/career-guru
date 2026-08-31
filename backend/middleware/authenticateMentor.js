const authenticateMentor = (req, res, next) => {

    if (req.role !== "mentor") {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    next();
};

export default authenticateMentor;