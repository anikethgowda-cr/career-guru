import mongoose from "mongoose";
import Message from "../models/messageSchema.js";
import Conversation from "../models/conversationSchema.js";

const chatSocket = (io) => {

    io.on("connection", (socket) => {

        console.log("=== Socket Connected ===");
        console.log("User ID:", socket.userId);
        console.log("Socket ID:", socket.id);
        console.log("Role:", socket.role);


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
        // DISCONNECT
        // =================================================

        socket.on("disconnect", () => {

            console.log(
                `User disconnected: ${socket.userId}`
            );

            console.log(
                `Socket ID: ${socket.id}`
            );

        });

    });

};

export default chatSocket;