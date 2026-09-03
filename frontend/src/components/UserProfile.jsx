import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { uploadResume, analyzeResume } from "../slices/ResumeSlice";
import { createProfile } from "../slices/ProfileSlice";
import { jobRoles, specializations } from "../constants/jobOptions";

export default function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, loading: authLoading } = useSelector((state) =>{
        return state.auth
    });

    const { uploadLoading, uploadSuccess, uploadError, analysisLoading, analysisError } = useSelector((state) =>{
        return  state.resume
    });

    const { loading: profileLoading, error: profileError } = useSelector((state )=>{
        return state.profile
    });
    
    const [formData, setFormData] = useState({ education: "", experience: "", preferredJobRole: "", preferredSpecialization: [], preferredLocation: "", linkedin: "" });
    const [resume, setResume] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    if (authLoading) {
        return <p>Loading...</p>;
    }

    function handleFormData(e) {
        const { name, value, selectedOptions } = e.target;
        if (name === "preferredJobRole") {
            setFormData({ ...formData, preferredJobRole: value, preferredSpecialization: [] });
            return;
        }
        if (name === "preferredSpecialization") {
            setFormData({ ...formData, preferredSpecialization: Array.from(selectedOptions, option => option.value) });
            return;
        }
        setFormData({ ...formData, [name]: value });
    }

    function handleResume(e) {
        const file = e.target.files[0];
        if (file) {
            setResume(file);
            setError("");
            setMessage("");
        }
    }

    async function handleUpload() {
        setError("");
        setMessage("");
        if (!resume) {
            setError("Please select a resume");
            return;
        }
        try {
            await dispatch(uploadResume(resume)).unwrap();
            setMessage("Resume uploaded successfully");
        } catch (err) {
            setError(err?.message || err || "Resume upload failed");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!formData.education.trim()) {
            return setError("Education is required");
        }

        if (!formData.experience.trim()) {
            return setError("Experience is required");
        }

        if (!formData.preferredJobRole) {
            return setError("Preferred job role is required");
        }

        if (!formData.preferredSpecialization.length) {
            return setError("Please select at least one specialization");
        }

        if (!formData.preferredLocation.trim()) {
            return setError("Preferred location is required");
        }

        if (!uploadSuccess) {
            return setError("Please upload your resume first");
        }

        try {
            await dispatch(analyzeResume({ preferredJobRole: formData.preferredJobRole, preferredSpecialization: formData.preferredSpecialization })).unwrap();
            await dispatch(createProfile(formData)).unwrap();
            navigate("/user/dashboard");
        } catch (err) {
            setError(err?.message || err || "Something went wrong");
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>User Profile</h2>

            <p>Username: {user?.username}</p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {message && <p style={{ color: "green" }}>{message}</p>}

            <label>Education:</label>
            <input type="text" name="education" value={formData.education} onChange={handleFormData} placeholder="Enter your education" required />
            <br />

            <label>Experience:</label>
            <input type="text" name="experience" value={formData.experience} onChange={handleFormData} placeholder="Enter your experience" required />
            <br />

            <label>Preferred Job Role:</label>
            <select name="preferredJobRole" value={formData.preferredJobRole} onChange={handleFormData} required>
                <option value="">Select Job Role</option>
                {jobRoles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            <br />

            <label>Preferred Specialization:</label>
            <select name="preferredSpecialization" multiple value={formData.preferredSpecialization} onChange={handleFormData} required>
                {formData.preferredJobRole && specializations[formData.preferredJobRole]?.map(specialization => <option key={specialization} value={specialization}>{specialization}</option>)}
            </select>
            <br />

            <label>Preferred Location:</label>
            <input type="text" name="preferredLocation" value={formData.preferredLocation} onChange={handleFormData} placeholder="Enter preferred location" required />
            <br />

            <label>LinkedIn:</label>
            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleFormData} placeholder="LinkedIn profile URL" />
            <br />

            <label>Resume:</label>
            <input type="file" accept=".pdf" onChange={handleResume} />
            <br />

            <button type="button" onClick={handleUpload} disabled={uploadLoading}>{uploadLoading ? "Uploading..." : "Upload Resume"}</button>
            <br />

            {uploadSuccess && <p style={{ color: "green" }}>Resume uploaded successfully</p>}

            {uploadError && <p style={{ color: "red" }}>{uploadError?.message || uploadError}</p>}

            <button type="submit" disabled={analysisLoading || profileLoading || uploadLoading}>{analysisLoading ? "Analyzing Resume..." : profileLoading ? "Creating Profile..." : "Create Profile"}</button>
        </form>
    );
}