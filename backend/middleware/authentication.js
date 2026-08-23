import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "Token is required"
        });
    }
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Invalid token format"
        });
    }
    const token = authHeader.split(" ")[1];

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = tokenData.userId;
        req.role = tokenData.role;

        next();
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
};

export default authenticateUser;