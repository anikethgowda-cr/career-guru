import "./MentorProfileModal.css";

export default function MentorProfileModal({ mentor, onClose }) {
    return (
        <div className="modal-overlay" onClick={onClose}>

            <div className="mentor-profile-modal" onClick={(e) => e.stopPropagation()}>

                <button className="modal-close" onClick={onClose}>
                    ×
                </button>

                <div className="modal-header">
                    <div className="modal-avatar">
                        {mentor.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="modal-title">
                        <h2>{mentor.name}</h2>
                        <p>{mentor.designation || "\u00A0"}</p>
                        <span>{mentor.organization || mentor.origin || "\u00A0"}</span>
                    </div>
                </div>

                <div className="modal-content">

                    <div className="modal-section">
                        <h3>About</h3>
                        <p>{mentor.bio || "No information available"}</p>
                    </div>

                    <div className="modal-grid">

                        <div className="modal-detail">
                            <span>Education</span>
                            <strong>{mentor.education || "\u00A0"}</strong>
                        </div>

                        <div className="modal-detail">
                            <span>Experience</span>
                            <strong>
                                {mentor.experience !== undefined && mentor.experience !== null
                                    ? `${mentor.experience} Years`
                                    : "\u00A0"}
                            </strong>
                        </div>

                        <div className="modal-detail">
                            <span>Work Type</span>
                            <strong>{mentor.workType || "\u00A0"}</strong>
                        </div>

                        <div className="modal-detail">
                            <span>Organization</span>
                            <strong>{mentor.organization || "\u00A0"}</strong>
                        </div>

                        <div className="modal-detail">
                            <span>Designation</span>
                            <strong>{mentor.designation || "\u00A0"}</strong>
                        </div>

                        <div className="modal-detail">
                            <span>Origin</span>
                            <strong>{mentor.origin || "\u00A0"}</strong>
                        </div>

                    </div>

                    <div className="modal-section">
                        <h3>Expert In</h3>

                        <div className="modal-tags">
                            {mentor.expertIn?.length > 0
                                ? mentor.expertIn.map((item, index) => (
                                    <span key={index}>{item}</span>
                                ))
                                : <span>&nbsp;</span>}
                        </div>
                    </div>

                    <div className="modal-section">
                        <h3>Specialization</h3>

                        <div className="modal-tags">
                            {mentor.specialization?.length > 0
                                ? mentor.specialization.map((item, index) => (
                                    <span key={index}>{item}</span>
                                ))
                                : <span>&nbsp;</span>}
                        </div>
                    </div>

                    <div className="modal-section">
                        <h3>Languages</h3>

                        <p className="modal-languages">
                            {mentor.languages?.length > 0
                                ? mentor.languages.join(", ")
                                : "\u00A0"}
                        </p>
                    </div>

                </div>

                <div className="modal-footer">
                    <button className="modal-talk-btn">
                        Talk to Mentor
                    </button>
                </div>

            </div>

        </div>
    );
}