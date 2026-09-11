import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileDetails } from "../../../slices/ProfileSlice";
import {
    fetchUserResume,
    uploadResume,
    analyzeResume,
    deleteUserResume
} from "../../../slices/user/ResumeSlice";
import { clearDashboardAnalysis, fetchResumeAnalysis } from "../../../slices/user/DashboardSlice";
import { jobRoles, specializations as roleSpecializationsCatalog } from "../../../constants/jobOptions";

export default function ProfileDetails({ data }) {
    const dispatch = useDispatch();
    const { user, profile } = data || {};

    const [isEditing, setIsEditing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resumeActionLoading, setResumeActionLoading] = useState(false);

    const fileInputRef = useRef(null);

    // Form state initialized from props
    const [formData, setFormData] = useState({
        username: user?.username || "",
        phone: user?.phone || "",
        education: profile?.education || "",
        experience: profile?.experience !== undefined && profile?.experience !== null ? profile.experience : 0,
        preferredJobRole: profile?.preferredJobRole || "Frontend Developer",
        preferredSpecialization: Array.isArray(profile?.preferredSpecialization) ? profile.preferredSpecialization : [],
        preferredLocation: profile?.preferredLocation || "",
        linkedin: profile?.linkedin || ""
    });

    // Resume slice state
    const userResume = useSelector((state) => state.resume?.data);

    // Fetch user resume on mount
    useEffect(() => {
        dispatch(fetchUserResume());
    }, [dispatch]);

    // Keep form in sync when profile prop updates
    useEffect(() => {
        if (profile) {
            setFormData({
                username: user?.username || "",
                phone: user?.phone || "",
                education: profile?.education || "",
                experience: profile?.experience !== undefined && profile?.experience !== null ? profile.experience : 0,
                preferredJobRole: profile?.preferredJobRole || "Frontend Developer",
                preferredSpecialization: Array.isArray(profile?.preferredSpecialization) ? profile.preferredSpecialization : [],
                preferredLocation: profile?.preferredLocation || "",
                linkedin: profile?.linkedin || ""
            });
        }
    }, [profile, user]);

    // Check if role or specialization changed in edit mode
    const origRole = profile?.preferredJobRole || "";
    const origSpecs = Array.isArray(profile?.preferredSpecialization) ? [...profile.preferredSpecialization].sort() : [];
    const currentSpecs = [...formData.preferredSpecialization].sort();

    const roleChanged = formData.preferredJobRole !== origRole;
    const specChanged = JSON.stringify(origSpecs) !== JSON.stringify(currentSpecs);
    const careerTargetChanged = roleChanged || specChanged;

    const availableSpecializations = roleSpecializationsCatalog[formData.preferredJobRole] || [];

    function handleFieldChange(e) {
        const { name, value } = e.target;
        if (name === "preferredJobRole") {
            setFormData((prev) => ({
                ...prev,
                preferredJobRole: value,
                preferredSpecialization: [] // Reset specializations when role changes
            }));
            return;
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    function toggleSpecialization(spec) {
        setFormData((prev) => {
            const exists = prev.preferredSpecialization.includes(spec);
            if (exists) {
                return {
                    ...prev,
                    preferredSpecialization: prev.preferredSpecialization.filter((s) => s !== spec)
                };
            } else {
                return {
                    ...prev,
                    preferredSpecialization: [...prev.preferredSpecialization, spec]
                };
            }
        });
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        setErrorMessage("");
        setStatusMessage(null);

        if (!formData.education.trim()) {
            setErrorMessage("Education is required.");
            return;
        }

        if (formData.preferredSpecialization.length === 0) {
            setErrorMessage("Please select at least one preferred specialization.");
            return;
        }

        setSaving(true);
        try {
            const result = await dispatch(updateProfileDetails(formData)).unwrap();
            setIsEditing(false);
            setStatusMessage({
                type: "success",
                text: result?.message || "Profile updated successfully."
            });

            // If career targets changed and auto-analysis was generated, refresh dashboard slice
            if (result?.reanalyzed) {
                dispatch(fetchResumeAnalysis());
            }

        } catch (err) {
            setErrorMessage(typeof err === "string" ? err : err?.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    function handleCancelEdit() {
        setErrorMessage("");
        setFormData({
            username: user?.username || "",
            phone: user?.phone || "",
            education: profile?.education || "",
            experience: profile?.experience !== undefined && profile?.experience !== null ? profile.experience : 0,
            preferredJobRole: profile?.preferredJobRole || "Frontend Developer",
            preferredSpecialization: Array.isArray(profile?.preferredSpecialization) ? profile.preferredSpecialization : [],
            preferredLocation: profile?.preferredLocation || "",
            linkedin: profile?.linkedin || ""
        });
        setIsEditing(false);
    }

    // Resume: Update/Upload new file
    async function handleResumeFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setErrorMessage("Only PDF resume files are supported.");
            return;
        }

        setResumeActionLoading(true);
        setErrorMessage("");
        setStatusMessage(null);

        try {
            await dispatch(uploadResume(file)).unwrap();
            // Automatically calculate new report against current role & specialization
            await dispatch(analyzeResume({
                preferredJobRole: formData.preferredJobRole,
                preferredSpecialization: formData.preferredSpecialization
            })).unwrap();

            dispatch(fetchUserResume());
            dispatch(fetchResumeAnalysis());

            setStatusMessage({
                type: "success",
                text: "Resume updated and ATS report recalculated successfully!"
            });

        } catch (err) {
            setErrorMessage(typeof err === "string" ? err : err?.message || "Resume upload/analysis failed.");
        } finally {
            setResumeActionLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    // Resume: Delete
    async function handleDeleteResume() {
        setResumeActionLoading(true);
        setErrorMessage("");
        setStatusMessage(null);

        try {
            await dispatch(deleteUserResume()).unwrap();
            dispatch(clearDashboardAnalysis());
            setShowDeleteModal(false);
            setStatusMessage({
                type: "success",
                text: "Resume and analysis report deleted successfully. Add a new resume to regenerate your report."
            });
        } catch (err) {
            setErrorMessage(typeof err === "string" ? err : err?.message || "Failed to delete resume.");
        } finally {
            setResumeActionLoading(false);
        }
    }

    const userInitial = (user?.username || user?.name || "U").charAt(0).toUpperCase();

    return (
        <div className="space-y-8 text-left max-w-4xl mx-auto">
            {/* Status & Error Alerts */}
            {statusMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                        {statusMessage.text}
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusMessage(null)}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-xs sm:text-sm text-red-800 dark:text-red-300 font-medium">
                        {errorMessage}
                    </div>
                    <button
                        type="button"
                        onClick={() => setErrorMessage("")}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* User Account Card */}
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 shrink-0">
                            {userInitial}
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {user?.username || "Student"}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                                {user?.email || "user@careerguru.ai"}
                            </p>
                            <div className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>Active Candidate Profile</span>
                            </div>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-900 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-zinc-700">
                            <span>✏️ Editing Mode</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Form (Read / Edit) */}
            <form onSubmit={handleSaveProfile} className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7">
                <div className="border-b border-[#E2E8F0]/80 dark:border-zinc-800 pb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Professional & Career Preferences
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            {isEditing
                                ? "Update your career details below. Click save to persist your preferences."
                                : "Review your current candidate background and target career trajectory."}
                        </p>
                    </div>

                    {isEditing && careerTargetChanged && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-900 dark:bg-amber-950/60 dark:text-amber-300 border border-indigo-200 dark:border-amber-800 animate-pulse">
                            ⚠️ Target Change Detected
                        </span>
                    )}
                </div>

                {/* Warning Alert if Target Role or Specialization is modified in Edit Mode */}
                {isEditing && careerTargetChanged && (
                    <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-amber-950/40 border border-indigo-100 dark:border-amber-900/60 flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <div className="text-xs text-indigo-900 dark:text-amber-200 leading-relaxed">
                            <strong>Note on Career Target Updates:</strong> Changing your Preferred Job Role or Specialization will automatically reset your existing <strong>Learning Plan</strong> and <strong>Interview Questions</strong> so you can generate fresh curricula tailored to this focus. Your <strong>Resume Analysis</strong> will be automatically recalculated on the fly.
                        </div>
                    </div>
                )}

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Username */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            Candidate Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleFieldChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200">
                                {user?.username || "Not specified"}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFieldChange}
                                placeholder="+91 9876543210"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200">
                                {user?.phone || "No phone number added"}
                            </div>
                        )}
                    </div>

                    {/* Education */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            Highest Education
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleFieldChange}
                                placeholder="e.g. B.Tech Computer Science"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200">
                                {profile?.education || "Not specified"}
                            </div>
                        )}
                    </div>

                    {/* Experience */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            Total Experience (Years)
                        </label>
                        {isEditing ? (
                            <input
                                type="number"
                                name="experience"
                                min="0"
                                max="40"
                                value={formData.experience}
                                onChange={handleFieldChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200">
                                {profile?.experience !== undefined ? `${profile.experience} Years` : "0 Years"}
                            </div>
                        )}
                    </div>

                    {/* Preferred Job Role */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            Preferred Job Role
                        </label>
                        {isEditing ? (
                            <select
                                name="preferredJobRole"
                                value={formData.preferredJobRole}
                                onChange={handleFieldChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors cursor-pointer"
                            >
                                {jobRoles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label} ({role.value})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs">
                                    {profile?.preferredJobRole || "Not specified"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Preferred Location */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            Preferred Location
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="preferredLocation"
                                value={formData.preferredLocation}
                                onChange={handleFieldChange}
                                placeholder="e.g. Bangalore, Remote"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200">
                                📍 {profile?.preferredLocation || "Not specified"}
                            </div>
                        )}
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                            LinkedIn Profile URL
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleFieldChange}
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D8C8] dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 text-xs sm:text-sm font-medium text-slate-800 dark:text-zinc-200">
                                {profile?.linkedin ? (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-700 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>{profile.linkedin}</span>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                ) : (
                                    "No LinkedIn URL added"
                                )}
                            </div>
                        )}
                    </div>

                    {/* Preferred Specializations Section */}
                    <div className="space-y-2 sm:col-span-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                                Preferred Specializations
                            </label>
                            {isEditing && (
                                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                                    Click to select/deselect technical focus areas
                                </span>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-[#E0D8C8] dark:border-zinc-700 space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {availableSpecializations.map((spec) => {
                                        const isSelected = formData.preferredSpecialization.includes(spec);
                                        return (
                                            <button
                                                key={spec}
                                                type="button"
                                                onClick={() => toggleSpecialization(spec)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                                                    isSelected
                                                        ? "bg-indigo-600 text-white shadow-xs"
                                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700"
                                                }`}
                                            >
                                                <span>{isSelected ? "✓" : "+"}</span>
                                                <span>{spec}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {availableSpecializations.length === 0 && (
                                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                                        No curated specializations found for this role.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(profile?.preferredSpecialization) && profile.preferredSpecialization.length > 0 ? (
                                    profile.preferredSpecialization.map((spec, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-zinc-800 text-indigo-900 dark:text-zinc-300 border border-indigo-100 dark:border-zinc-700"
                                        >
                                            ⭐ {spec} Focus
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                                        No preferred specializations selected.
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Mode Save / Cancel Buttons */}
                {isEditing && (
                    <div className="pt-4 border-t border-[#E2E8F0]/80 dark:border-zinc-800 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saving Profile Changes...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                )}
            </form>

            {/* Resume Management Card */}
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Resume Document & Analysis Engine
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Manage your PDF resume. Updating your resume immediately recalculates your ATS score and feedback.
                        </p>
                    </div>

                    {/* Hidden file input for Upload/Update */}
                    <input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleResumeFileChange}
                        className="hidden"
                    />
                </div>

                {/* Resume Status Box */}
                {userResume && userResume.filePath ? (
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-red-100/80 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                                PDF
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                                    {userResume.fileName || "Uploaded Resume.pdf"}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        Analyzed & Active
                                    </span>
                                    {userResume.updatedAt && (
                                        <span>
                                            &bull; Updated {new Date(userResume.updatedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Resume Actions: Download, Update, Delete */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                            {/* Download */}
                            <a
                                href={userResume.filePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download</span>
                            </a>

                            {/* Update Resume */}
                            <button
                                type="button"
                                disabled={resumeActionLoading}
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/60 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/80 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>{resumeActionLoading ? "Updating..." : "Update Resume"}</span>
                            </button>

                            {/* Delete Resume */}
                            <button
                                type="button"
                                disabled={resumeActionLoading}
                                onClick={() => setShowDeleteModal(true)}
                                className="px-3.5 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 rounded-2xl bg-white dark:bg-zinc-950/60 border border-dashed border-[#E2E8F0] dark:border-zinc-800 text-center space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                No Resume Uploaded Yet
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                                Upload your PDF resume to generate an instant ATS score, identify missing skills, and unlock tailored interview challenges.
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={resumeActionLoading}
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>{resumeActionLoading ? "Uploading & Analyzing..." : "Upload Resume (PDF)"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Resume Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-left">
                        <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Delete Uploaded Resume?
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                This will permanently remove your stored PDF resume and delete your current ATS resume analysis. Your dashboard will prompt you to add a resume until a new one is uploaded.
                            </p>
                        </div>
                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={resumeActionLoading}
                                onClick={handleDeleteResume}
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {resumeActionLoading ? "Deleting..." : "Yes, Delete Resume"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}