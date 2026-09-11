import mongoose from "mongoose";
import Message from "../models/messageSchema.js";
import Conversation from "../models/conversationSchema.js";
import User from "../models/userSchema.js";

// Active in-call registry: userId (string) -> { conversationId, peerId, callType }
const userCallStatus = new Map();

const chatSocket = (io) => {

    io.on("connection", (socket) => {

        console.log("=== Socket Connected ===");
        console.log("User ID:", socket.userId);
        console.log("Socket ID:", socket.id);
        console.log("Role:", socket.role);


        // =================================================
        // JOIN PRIVATE USER ROOM
        // =================================================

        socket.join(`user:${socket.userId}`);


        // =================================================
        // JOIN CONVERSATION
        // =================================================

        socket.on("joinConversation", async (data, callback) => {

            try {

                const { conversationId } = data || {};

                // Validate conversationId
                if (!conversationId) {

                    const response = {
                        success: false,
                        message: "conversationId is required"
                    };

                    if (callback) callback(response);

                    return socket.emit("chatError", response);
                }


                // Validate MongoDB ObjectId
                if (!mongoose.Types.ObjectId.isValid(conversationId)) {

                    const response = {
                        success: false,
                        message: "Invalid conversationId"
                    };

                    if (callback) callback(response);

                    return socket.emit("chatError", response);
                }


                // Check whether user belongs
                // to this conversation
                const conversation = await Conversation.findOne({

                    _id: conversationId,

                    $or: [
                        { student: socket.userId },
                        { mentor: socket.userId }
                    ]

                });


                if (!conversation) {

                    const response = {
                        success: false,
                        message:
                            "You are not a participant in this conversation"
                    };

                    if (callback) callback(response);

                    return socket.emit("chatError", response);
                }


                // Join Socket.IO room
                socket.join(conversationId.toString());

                console.log(
                    `User ${socket.userId} joined conversation ${conversationId}`
                );


                const response = {
                    success: true,
                    conversationId: conversationId.toString()
                };


                if (callback) {
                    callback(response);
                }


                socket.emit(
                    "joinedConversation",
                    response
                );


            } catch (error) {

                console.error(
                    "Join conversation error:",
                    error
                );

                const response = {
                    success: false,
                    message: "Failed to join conversation"
                };

                if (callback) {
                    callback(response);
                }

                socket.emit(
                    "chatError",
                    response
                );
            }

        });


        // =================================================
        // SEND MESSAGE
        // =================================================

        socket.on("sendMessage", async (data, callback) => {

            try {

                const {
                    conversationId,
                    message
                } = data || {};


                // Validate input
                if (
                    !conversationId ||
                    !message ||
                    !message.trim()
                ) {

                    const response = {
                        success: false,
                        message:
                            "conversationId and message are required"
                    };

                    if (callback) callback(response);

                    return socket.emit(
                        "chatError",
                        response
                    );
                }


                // Validate ObjectId
                if (
                    !mongoose.Types.ObjectId.isValid(
                        conversationId
                    )
                ) {

                    const response = {
                        success: false,
                        message: "Invalid conversationId"
                    };

                    if (callback) callback(response);

                    return socket.emit(
                        "chatError",
                        response
                    );
                }


                // Verify that the user belongs
                // to the conversation
                const conversation = await Conversation.findOne({

                    _id: conversationId,

                    $or: [
                        { student: socket.userId },
                        { mentor: socket.userId }
                    ]

                });


                if (!conversation) {

                    const response = {
                        success: false,
                        message:
                            "You are not part of this conversation"
                    };

                    if (callback) callback(response);

                    return socket.emit(
                        "chatError",
                        response
                    );
                }


                // Enforce private 1-on-1
                // Verify sender matches their role's field
                const isAuthorized =
                    socket.role === "mentor"
                        ? conversation.mentor.toString() === socket.userId
                        : conversation.student.toString() === socket.userId;

                if (!isAuthorized) {

                    const response = {
                        success: false,
                        message:
                            "You are not authorized to send messages in this conversation"
                    };

                    if (callback) callback(response);

                    return socket.emit(
                        "chatError",
                        response
                    );
                }


                // Save message to MongoDB
                const newMessage = await Message.create({

                    conversation: conversationId,

                    sender: socket.userId,

                    message: message.trim()

                });


                // Get sender username
                await newMessage.populate(
                    "sender",
                    "username"
                );


                // Update conversation timestamp
                conversation.updatedAt = new Date();

                await conversation.save();


                console.log(
                    `Message ${newMessage._id} saved`
                );


                // Send message to everyone
                // inside this conversation
                io.to(
                    conversationId.toString()
                ).emit(
                    "receiveMessage",
                    newMessage
                );


                // Acknowledge sender
                if (callback) {

                    callback({
                        success: true,
                        data: newMessage
                    });

                }


            } catch (error) {

                console.error(
                    "Send message error:",
                    error
                );

                const response = {
                    success: false,
                    message: "Failed to send message"
                };

                if (callback) {
                    callback(response);
                }

                socket.emit(
                    "chatError",
                    response
                );
            }

        });


        // =================================================
        // VOICE CALL SIGNALING
        // =================================================

        // -------------------------------------------------
        // CALL USER
        // -------------------------------------------------

        socket.on("call-user", async (data, callback) => {
            const {
                conversationId,
                targetUserId,
                callType
            } = data || {};

            if (!conversationId || !targetUserId) {
                if (callback) {
                    callback({
                        success: false,
                        message: "Conversation ID and target user are required"
                    });
                }
                return;
            }

            if (!mongoose.Types.ObjectId.isValid(conversationId)) {
                if (callback) {
                    callback({
                        success: false,
                        message: "Invalid conversation ID"
                    });
                }
                return;
            }

            if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
                if (callback) {
                    callback({
                        success: false,
                        message: "Invalid target user ID"
                    });
                }
                return;
            }

            // Check if target user is currently in another call
            if (userCallStatus.has(targetUserId.toString())) {
                const targetCall = userCallStatus.get(targetUserId.toString());
                // If they were in a call with this very same socket/caller, clear it so they can reconnect!
                if (targetCall && targetCall.peerId.toString() === socket.userId.toString()) {
                    userCallStatus.delete(targetUserId.toString());
                    userCallStatus.delete(socket.userId.toString());
                } else {
                    const targetRoom = io.sockets.adapter.rooms.get(`user:${targetUserId}`);
                    if (!targetRoom || targetRoom.size === 0) {
                        // User is disconnected, purge stale status
                        userCallStatus.delete(targetUserId.toString());
                    } else {
                        console.log(`[Call Busy] Target user ${targetUserId} is already in a call.`);
                        if (callback) {
                            return callback({
                                success: false,
                                isBusy: true,
                                message: "The person you are calling is currently on another call."
                            });
                        }
                        return;
                    }
                }
            }

            // If caller had a leftover call status, clear it
            if (userCallStatus.has(socket.userId.toString())) {
                userCallStatus.delete(socket.userId.toString());
            }

            const conversation =
                await Conversation.findById(conversationId);

            if (!conversation) {
                if (callback) {
                    callback({
                        success: false,
                        message: "Conversation not found"
                    });
                }
                return;
            }

            const currentUserId =
                socket.userId.toString();

            const studentId =
                conversation.student.toString();

            const mentorId =
                conversation.mentor.toString();

            const isParticipant =
                currentUserId === studentId ||
                currentUserId === mentorId;

            const isTargetParticipant =
                targetUserId.toString() === studentId ||
                targetUserId.toString() === mentorId;

            if (!isParticipant || !isTargetParticipant) {
                if (callback) {
                    callback({
                        success: false,
                        message: "Unauthorized call"
                    });
                }
                return;
            }

            let callerName = socket.role === "mentor" ? "Mentor" : "Student";
            try {
                const callerDoc = await User.findById(socket.userId).select("username");
                if (callerDoc?.username) {
                    callerName = callerDoc.username;
                }
            } catch (err) {
                console.error("Error fetching caller name:", err.message);
            }

            const eventName =
                callType === "video"
                    ? "incoming-video-call"
                    : "incoming-call";

            io.to(`user:${targetUserId}`).emit(
                eventName,
                {
                    conversationId:
                        conversationId.toString(),
                    callerId: socket.userId,
                    callerRole: socket.role,
                    callerName,
                    callType: callType || "voice"
                }
            );

            if (callback) {
                callback({
                    success: true,
                    message: "Call request sent"
                });
            }
        });

        // -------------------------------------------------
        // CALL ACCEPTED
        // -------------------------------------------------

        socket.on("call-accepted", (data) => {

            const {
                callerId,
                conversationId,
                callType
            } = data || {};

            if (!callerId || !conversationId) {
                return;
            }

            // Register both users in active calls registry
            userCallStatus.set(socket.userId.toString(), {
                conversationId: conversationId.toString(),
                peerId: callerId.toString(),
                callType: callType || "call"
            });
            userCallStatus.set(callerId.toString(), {
                conversationId: conversationId.toString(),
                peerId: socket.userId.toString(),
                callType: callType || "call"
            });

            console.log(`[Call Active] Between ${socket.userId} and ${callerId}`);

            io.to(`user:${callerId}`).emit(
                "call-accepted",
                {
                    conversationId,
                    acceptedBy:
                        socket.userId
                }
            );

        });

        // -------------------------------------------------
        // CALL REJECTED
        // -------------------------------------------------

        socket.on("call-rejected", (data) => {

            const {
                callerId,
                conversationId
            } = data || {};

            if (!callerId || !conversationId) {
                return;
            }

            userCallStatus.delete(socket.userId.toString());
            userCallStatus.delete(callerId.toString());

            io.to(`user:${callerId}`).emit(
                "call-rejected",
                {
                    conversationId,
                    rejectedBy:
                        socket.userId
                }
            );

        });

        // -------------------------------------------------
        // CALL ENDED
        // -------------------------------------------------

        socket.on("call-ended", (data) => {

            const {
                targetUserId,
                conversationId
            } = data || {};

            if (!targetUserId || !conversationId) {
                return;
            }

            userCallStatus.delete(socket.userId.toString());
            userCallStatus.delete(targetUserId.toString());
            console.log(`[Call Ended] Call between ${socket.userId} and ${targetUserId} cleared.`);

            io.to(`user:${targetUserId}`).emit(
                "call-ended",
                {
                    conversationId,
                    endedBy:
                        socket.userId
                }
            );

        });


        // -------------------------------------------------
        // WEBRTC OFFER
        // -------------------------------------------------

        socket.on("webrtc-offer", (data) => {

            const {
                targetUserId,
                conversationId,
                offer
            } = data || {};


            if (
                !targetUserId ||
                !conversationId ||
                !offer
            ) {
                return;
            }


            io.to(`user:${targetUserId}`).emit(
                "webrtc-offer",
                {
                    conversationId,

                    callerId:
                        socket.userId,

                    offer
                }
            );

        });


        // -------------------------------------------------
        // WEBRTC ANSWER
        // -------------------------------------------------

        socket.on("webrtc-answer", (data) => {

            const {
                targetUserId,
                conversationId,
                answer
            } = data || {};


            if (
                !targetUserId ||
                !conversationId ||
                !answer
            ) {
                return;
            }


            io.to(`user:${targetUserId}`).emit(
                "webrtc-answer",
                {
                    conversationId,

                    answer,

                    answeredBy:
                        socket.userId
                }
            );

        });


        // -------------------------------------------------
        // ICE CANDIDATE
        // -------------------------------------------------

        socket.on("ice-candidate", (data) => {

            const {
                targetUserId,
                conversationId,
                candidate
            } = data || {};


            if (
                !targetUserId ||
                !conversationId ||
                !candidate
            ) {
                return;
            }


            io.to(`user:${targetUserId}`).emit(
                "ice-candidate",
                {
                    conversationId,

                    candidate,

                    senderId:
                        socket.userId
                }
            );

        });

        // -------------------------------------------------
        // SCREEN SHARE STATUS
        // -------------------------------------------------

        socket.on("screen-share-status", (data) => {

            const {
                targetUserId,
                conversationId,
                isSharing
            } = data || {};

            if (
                !targetUserId ||
                !conversationId
            ) {
                return;
            }

            io.to(`user:${targetUserId}`).emit(
                "screen-share-status",
                {
                    conversationId,
                    isSharing: !!isSharing,
                    sharedBy: socket.userId
                }
            );

        });


        // =================================================
        // DISCONNECT
        // =================================================

        socket.on("disconnect", () => {

            console.log(
                `User disconnected: ${socket.userId}`
            );

            console.log(
                `Socket ID: ${socket.id}`
            );

            if (socket.userId && userCallStatus.has(socket.userId.toString())) {
                const callInfo = userCallStatus.get(socket.userId.toString());
                userCallStatus.delete(socket.userId.toString());

                if (callInfo?.peerId) {
                    userCallStatus.delete(callInfo.peerId.toString());
                    console.log(`[Call Cleanup on Disconnect] Cleared active call for peer ${callInfo.peerId}`);
                    io.to(`user:${callInfo.peerId}`).emit("call-ended", {
                        conversationId: callInfo.conversationId,
                        endedBy: socket.userId
                    });
                }
            }

        });

    });

};

export default chatSocket;