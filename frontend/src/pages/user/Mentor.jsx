import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentors } from "../../slices/MentorSlice";
import MentorsCard from "../../components/user/mentor/MentorsCard";

export default function Mentor() {
    const dispatch = useDispatch();
    const { mentors, loading, serverError } = useSelector((state) => state.mentor);

    useEffect(() => {
        dispatch(fetchMentors());
    }, [dispatch]);

    if (loading) {
        return <p>Loading mentors...</p>;
    }

    if (serverError) {
        return <p>{serverError.message}</p>;
    }

    return (
        <>
            <h1>Find a Mentor</h1>

            <div className="mentor-container">
                {mentors?.map((mentor) => (
                    <MentorsCard key={mentor._id} mentor={mentor} />
                ))}
            </div>
        </>
    );
}