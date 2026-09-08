import { useDispatch, useSelector } from "react-redux";
import { updateAvailability } from "../../../slices/mentor/MentorDashboardSlice";

export default function PauseMentorship() {
    const dispatch = useDispatch();
    const { availability, updatingAvailability } = useSelector((state) => state.mentorDashboard);

    const isAvailable = availability?.isAvailable ?? true;

    function handleToggle() {
        dispatch(updateAvailability(!isAvailable));
    }

    return (
        <div className="pause-mentorship-card">
            <div className="pause-mentorship-header">
                <h3>Mentorship Status</h3>
                <span className={`status-badge ${isAvailable ? "active" : "paused"}`}>
                    <span className="status-badge-dot"></span>
                    {isAvailable ? "Active" : "Paused"}
                </span>
            </div>

            <div className="pause-toggle-container">
                <div className="pause-toggle-row">
                    <span className="pause-toggle-label">
                        {isAvailable ? "Accepting new mentees" : "Mentorship paused"}
                    </span>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={handleToggle}
                            disabled={updatingAvailability}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <p className="pause-description">
                    {isAvailable ? (
                        <>
                            <strong>You are visible</strong> on Explore Mentors.
                            New students can find and connect with you.
                        </>
                    ) : (
                        <>
                            <strong>You are hidden</strong> from Explore Mentors.
                            New students cannot find you, but your existing mentees
                            can still message and access your profile.
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
