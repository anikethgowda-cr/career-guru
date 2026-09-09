import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentees, clearMentees } from "../../slices/mentor/MenteesSlice";
import MenteeCard from "../../components/mentor/mentees/MenteeCard";
import "../../components/mentor/mentees/MenteeCard.css";

export default function Mentees() {
    const dispatch = useDispatch();
    const { mentees, loading, serverError } = useSelector((state) => state.mentees);

    useEffect(() => {
        dispatch(fetchMentees());
        return () => { dispatch(clearMentees()); };
    }, [dispatch]);

    if (loading) {
        return (
            <div className="mentees-page">
                <p className="mentees-loading">Loading your mentees...</p>
            </div>
        );
    }

    if (serverError) {
        return (
            <div className="mentees-page">
                <p className="mentees-error">{serverError.message}</p>
            </div>
        );
    }
    

    return (
        <div className="mentees-page">
            <h1>My Mentees</h1>
            <p className="mentees-subtitle">Students who have connected with you</p>

            {mentees.length === 0 ? (
                <div className="mentees-empty">
                    <h3>No mentees yet</h3>
                    <p>Students who send you a message will appear here.</p>
                </div>
            ) : (
                <div className="mentees-container">
                    {mentees.map((mentee) => (
                        <MenteeCard key={mentee.conversationId} mentee={mentee} studentId={mentee?.student._id}/>
                    ))}
                </div>
            )}
        </div>
    );
}