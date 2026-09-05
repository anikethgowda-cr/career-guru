import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchConversations } from "../../../slices/MentorChatSlice";

export default function MentorConversations() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { conversations, conversationsLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    function handleOpenConversation(conversationId) {
        navigate(`/mentor/chat/${conversationId}`);
    }

    if (conversationsLoading) {
        return <p>Loading conversations...</p>;
    }

    if (serverError) {
        return <p>{serverError.message}</p>;
    }

    if (!conversations.length) {
        return <p>No conversations yet.</p>;
    }

    return (
        <div>
            <h1>Messages</h1>

            {conversations.map((conversation) => (
                <div
                    key={conversation._id}
                    onClick={() => handleOpenConversation(conversation._id)}
                >
                    <h3>{conversation.student?.username}</h3>
                    <p>{conversation.student?.email}</p>
                </div>
            ))}
        </div>
    );
}