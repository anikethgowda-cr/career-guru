import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../slices/MentorChatSlice";
import MentorMessagesList from "../../components/mentor/messages/MentorMessagesList";
import "../../components/mentor/messages/MentorMessagesList.css";

export default function MentorMessages() {
    const dispatch = useDispatch();
    const { conversations, conversationsLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    if (conversationsLoading) {
        return (
            <div className="mentor-messages-page">
                <p className="mentor-messages-loading">Loading messages...</p>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="mentor-messages-page">
                <p>{serverError.message}</p>
            </div>
        );
    }

    return (
        <div className="mentor-messages-page">
            <h1>Messages</h1>
            <p className="mentor-messages-subtitle">Your active student conversations</p>
            <MentorMessagesList conversations={conversations} />
        </div>
    );
}
