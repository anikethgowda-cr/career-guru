import "./MentorsCard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorProfileModal from "./MentorProfileModal";


export default function MentorsCard({ mentor }) {
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);

    function handleViewProfile() {
        setShowModal(true);
    }

    function handleTalkToMentor() {
        navigate(`/user/mentor/chat/${mentor.userId}`);
    }

    return (
        <>
            <div className="mentor-card">

                <div className="mentor-header">
                    <div className="mentor-avatar">
                        {mentor.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="mentor-title">
                        <h2>{mentor.name}</h2>
                        <p>{mentor.designation}</p>
                        <div className="mentor-company">
                            {mentor.organization || mentor.origin || "\u00A0"}
                        </div>
                    </div>
                </div>

                <div className="mentor-info">
                    <div className="info-item">
                        <span>Experience</span>
                        <strong>
                            {mentor.experience !== undefined && mentor.experience !== null
                                ? `${mentor.experience} Years`
                                : "\u00A0"}
                        </strong>
                    </div>

                    <div className="info-item">
                        <span>Work Type</span>
                        <strong>{mentor.workType || "\u00A0"}</strong>
                    </div>
                </div>

                <div className="mentor-section specialization-section">
                    <span className="section-title">Specialization</span>

                    <div className="tag-container">
                        {mentor.specialization?.length > 0
                            ? mentor.specialization.map((item, index) => (
                                <span className="tag" key={index}>
                                    {item}
                                </span>
                            ))
                            : <span>&nbsp;</span>}
                    </div>
                </div>

                <div className="mentor-section languages-section">
                    <span className="section-title">Languages</span>

                    <p className="languages">
                        {mentor.languages?.length > 0
                            ? mentor.languages.join(", ")
                            : "\u00A0"}
                    </p>
                </div>

                <div className="mentor-buttons">
                    <button
                        className="view-btn"
                        onClick={handleViewProfile}
                    >
                        View Profile
                    </button>

                    <button
                        className="talk-btn"
                        onClick={handleTalkToMentor}
                    >
                        Talk to Mentor
                    </button>
                </div>

            </div>

            {showModal && (
                <MentorProfileModal
                    mentor={mentor}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}