export default function MentorProfileDetails({ data }) {
    const { mentor, profile } = data;

    return (
        <form>
            <h2>Profile</h2>

            <h3>Personal Details</h3>

            <label>Username:</label>
            <input type="text" value={mentor?.username || ""} readOnly />
            <br />

            <label>Email:</label>
            <input type="email" value={mentor?.email || ""} readOnly />
            <br />

            <label>Phone:</label>
            <input type="text" value={mentor?.phone || ""} readOnly />
            <br />

            <h3>Mentor Details</h3>

            <label>Name:</label>
            <input type="text" value={profile?.name || ""} readOnly />
            <br />

            <label>Education:</label>
            <input type="text" value={profile?.education || ""} readOnly />
            <br />

            <label>Work Type:</label>
            <input type="text" value={profile?.workType || ""} readOnly />
            <br />

            <label>Experience:</label>
            <input type="text" value={profile?.experience || 0 } readOnly />
            <br />

            <label>Expert In:</label>
            <input type="text" value={profile?.expertIn || ""} readOnly />
            <br />

            <label>Specialization:</label>
            <input type="text" value={profile?.specialization || ""} readOnly />
            <br />

            <label>Bio:</label>
            <textarea value={profile?.bio || ""} readOnly />
            <br />

            <label>Languages:</label>
            <input type="text" value={profile?.languages?.join(", ") || ""} readOnly />
            <br />

            <label>Organization:</label>
            <input type="text" value={profile?.organization || ""} readOnly />
            <br />

            <label>Designation:</label>
            <input type="text" value={profile?.designation || ""} readOnly />
            <br />

            <label>Origin:</label>
            <input type="text" value={profile?.origin || ""} readOnly />
            <br />
        </form>
    );
}

