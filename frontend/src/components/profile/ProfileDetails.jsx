import "./ProfileDetails.css";

export default function ProfileDetails({ data }) {

    const { user, profile } = data;

    return (
        <div className="profile-container">

            <form className="profile-form">

                <h1>Profile</h1>

                <div className="profile-field">
                    <label>Username</label>
                    <input
                        type="text"
                        value={user?.username || ""}
                        readOnly
                    />
                </div>

                <div className="profile-field">
                    <label>Email</label>
                    <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                    />
                </div>

                <div className="profile-field">
                    <label>Phone</label>
                    <input
                        type="text"
                        value={user?.phone || ""}
                        readOnly
                    />
                </div>

                <div className="profile-field">
                    <label>Education</label>
                    <input
                        type="text"
                        value={profile?.education || ""}
                        readOnly
                    />
                </div>

                <div className="profile-field">
                    <label>Experience</label>
                    <input
                        type="text"
                        value={profile?.experience || 0}
                        readOnly
                    />
                </div>

                <div className="profile-field">
                    <label>Preferred Job Role</label>
                    <input
                        type="text"
                        value={profile?.preferredJobRole || ""}
                        readOnly
                    />
                </div>

                <div className="profile-field">
                    <label>Preferred Location</label>
                    <input
                        type="text"
                        value={profile?.preferredLocation || ""}
                        readOnly
                    />
                </div>

                <div className="profile-field">
                    <label>LinkedIn</label>
                    <input
                        type="text"
                        value={profile?.linkedin || ""}
                        readOnly
                    />
                </div>

            </form>

        </div>
    );
}