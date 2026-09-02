import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "../config/axios-config";
import { useNavigate } from "react-router-dom";

export default function MentorProfile() {

    const { user, loading } = useSelector(
        (state) => state.auth
    );
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        designation: "",
        company: "",
        yearsOfExperience: "",
        specialization: "",
        bio: "",
        hourlyRate: "",
        availableSlots: [],
        languages: ""
    });

    const [slot, setSlot] = useState({
        date: "",
        startTime: "",
        endTime: ""
    });

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading) {
        return <p>Loading...</p>;
    }

    function handleFormData(e) {

        const name = e.target.name;
        const value = e.target.value;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    function handleSlot(e) {

        const name = e.target.name;
        const value = e.target.value;

        setSlot({
            ...slot,
            [name]: value
        });
    }

    function handleAddSlot() {

        if (!slot.date) {
            setError("Date is required");
            return;
        }

        if (!slot.startTime) {
            setError("Start time is required");
            return;
        }

        if (!slot.endTime) {
            setError("End time is required");
            return;
        }

        if (slot.startTime >= slot.endTime) {
            setError("End time must be after start time");
            return;
        }

        setFormData({
            ...formData,
            availableSlots: [
                ...formData.availableSlots,
                {
                    date: slot.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                }
            ]
        });

        setSlot({
            date: "",
            startTime: "",
            endTime: ""
        });

        setError("");
    }

    function handleRemoveSlot(index) {

        const updatedSlots = formData.availableSlots.filter(
            (_, slotIndex) => slotIndex !== index
        );

        setFormData({
            ...formData,
            availableSlots: updatedSlots
        });
    }

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");

        if (!formData.designation.trim()) {
            setError("Designation is required");
            return;
        }

        if (!formData.company.trim()) {
            setError("Company is required");
            return;
        }

        if (!formData.yearsOfExperience) {
            setError("Years of experience is required");
            return;
        }

        if (!formData.specialization.trim()) {
            setError("Specialization is required");
            return;
        }

        if (!formData.bio.trim()) {
            setError("Bio is required");
            return;
        }

        if (!formData.hourlyRate) {
            setError("Hourly rate is required");
            return;
        }

        if (formData.availableSlots.length === 0) {
            setError("At least one available slot is required");
            return;
        }

        if (!formData.languages.trim()) {
            setError("Languages are required");
            return;
        }

        try {

            setIsSubmitting(true);

            const data = {
                designation: formData.designation,
                company: formData.company,
                yearsOfExperience: Number(formData.yearsOfExperience),
                specialization: formData.specialization,
                bio: formData.bio,
                hourlyRate: Number(formData.hourlyRate),
                availableSlots: formData.availableSlots,
                languages: formData.languages
                    .split(",")
                    .map(language => language.trim())
                    .filter(language => language !== "")
            };

            const response = await axios.post(
                "/mentor/profile",
                data
            );

            console.log(response.data);

            if (!response.data.success) {
                setError("Profile creation failed");
                return;
            }

            navigate("/mentor/dashboard");

        } catch (err) {

            console.log(
                err.response?.data?.message ||
                "Something went wrong"
            );

            setError(
                err.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setIsSubmitting(false);

        }
    }

    return (
        <>
            <h1>Mentor Profile</h1>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                <label>Username:</label>{" "}
                <input
                    type="text"
                    value={user?.username || ""}
                    readOnly
                />

                <br />

                <label>Designation:</label>
                <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleFormData}
                />

                <br />

                <label>Company:</label>
                <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleFormData}
                />

                <br />

                <label>Years of Experience:</label>
                <input
                    type="number"
                    name="yearsOfExperience"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={handleFormData}
                />

                <br />

                <label>Specialization:</label>
                <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleFormData}
                />

                <br />

                <label>Bio:</label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleFormData}
                />

                <br />

                <label>Hourly Rate:</label>
                <input
                    type="number"
                    name="hourlyRate"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={handleFormData}
                />

                <br />

                <h3>Available Slots</h3>

                <label>Date:</label>
                <input
                    type="date"
                    name="date"
                    value={slot.date}
                    onChange={handleSlot}
                />

                <br />

                <label>Start Time:</label>
                <input
                    type="time"
                    name="startTime"
                    value={slot.startTime}
                    onChange={handleSlot}
                />

                <br />

                <label>End Time:</label>
                <input
                    type="time"
                    name="endTime"
                    value={slot.endTime}
                    onChange={handleSlot}
                />

                <br />

                <button
                    type="button"
                    onClick={handleAddSlot}
                >
                    Add Slot
                </button>

                <br />
                <br />

                {formData.availableSlots.map((slot, index) => (
                    <div key={index}>

                        <span>
                            {slot.date} | {slot.startTime} - {slot.endTime}
                        </span>

                        {" "}

                        <button
                            type="button"
                            onClick={() => handleRemoveSlot(index)}
                        >
                            Remove
                        </button>

                    </div>
                ))}

                <br />

                <label>Languages:</label>
                <input
                    type="text"
                    name="languages"
                    placeholder="English, Kannada, Hindi"
                    value={formData.languages}
                    onChange={handleFormData}
                />

                <br />

                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Creating Profile..."
                        : "Create Profile"
                    }
                </button>

            </form>
        </>
    );
}