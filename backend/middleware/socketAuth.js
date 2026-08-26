import jwt from "jsonwebtoken";

const socketAuth = (socket, next) => {

    try {

        let token = socket.handshake.auth?.token;

        // For Postman testing
        if (!token) {
            token = socket.handshake.headers?.token;
        }

        if (!token) {

            return next(
                new Error("Authentication required")
            );

        }

        // Support:
        // "Bearer eyJ..."
        if (token.startsWith("Bearer ")) {

            token = token.substring(7);

        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Store authenticated user information
        // inside socket
        socket.userId = decoded.userId;
        socket.role = decoded.role;

        console.log(
            `Socket authenticated: ${socket.userId}`
        );

        next();

    } catch (error) {

        console.error(
            "Socket authentication failed:",
            error.message
        );

        next(
            new Error("Invalid or expired token")
        );

    }

};

export default socketAuth;