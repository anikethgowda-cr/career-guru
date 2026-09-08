import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../slices/MentorChatSlice";
import MyMentorsList from "../../components/user/myMentors/MyMentorsList";
import "../../components/user/myMentors/MyMentorsList.css";

export default function MyMentors() {
    const dispatch = useDispatch();
    const { conversations, conversationsLoading, serverError } = useSelector(
        (state) => state.mentorChat
    );

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    if (conversationsLoading) {
        return (
            <div className="my-mentors-page">
                <p className="my-mentors-loading">Loading your mentors...</p>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="my-mentors-page">
                <p>{serverError.message}</p>
            </div>
        );
    }

    return (
        <div className="my-mentors-page">
            <h1>My Mentors</h1>
            <p className="my-mentors-subtitle">Your active mentor conversations</p>
            <MyMentorsList conversations={conversations} />
        </div>
    );
}
