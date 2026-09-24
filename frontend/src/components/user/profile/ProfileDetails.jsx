import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { updateProfileDetails, deleteUserAccount } from "../../../slices/ProfileSlice";
import { logout } from "../../../slices/AuthSlice";
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
    const navigate = useNavigate();
    const { user, profile } = data || {};

    const [isEditing, setIsEditing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [resumeActionLoading, setResumeActionLoading] = useState(false);
    const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

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

    // Resume & Dashboard slice state
    const userResume = useSelector((state) => state.resume?.data);
    const dashboardAnalysis = useSelector((state) => state.dashboard?.data);
    const resumeAnalysis = useSelector((state) => state.resume?.analysis);
    const analysisData = dashboardAnalysis || resumeAnalysis;
    const dashboardLoading = useSelector((state) => state.dashboard?.loading);

    // Fetch user resume and analysis on mount
    useEffect(() => {
        dispatch(fetchUserResume());
        dispatch(fetchResumeAnalysis());
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

        const targetRole = formData.preferredJobRole || profile?.preferredJobRole;
        const targetSpecs = formData.preferredSpecialization?.length
            ? formData.preferredSpecialization
            : profile?.preferredSpecialization;

        try {
            // 1. Update resume in Cloudinary and update URL in DB
            await dispatch(uploadResume(file)).unwrap();

            // 2. Trigger generate resume analysis API (extracts text via middleware & analyzes new resume)
            await dispatch(analyzeResume({
                preferredJobRole: targetRole,
                preferredSpecialization: targetSpecs
            })).unwrap();

            // 3. Refresh user resume and ATS analysis
            dispatch(fetchUserResume());
            dispatch(fetchResumeAnalysis());

            setStatusMessage({
                type: "success",
                text: "Resume updated in Cloudinary, analyzed successfully with your new resume, and roadmaps refreshed!"
            });

        } catch (err) {
            // Fallback: If upload succeeded but auto-analysis needed separate call
            try {
                await dispatch(analyzeResume({
                    preferredJobRole: targetRole,
                    preferredSpecialization: targetSpecs
                })).unwrap();
                dispatch(fetchUserResume());
                dispatch(fetchResumeAnalysis());
                setStatusMessage({
                    type: "success",
                    text: "Resume updated and ATS report analyzed successfully!"
                });
            } catch (retryErr) {
                setErrorMessage(typeof err === "string" ? err : err?.message || "Resume upload/analysis failed.");
            }
        } finally {
            setResumeActionLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    async function handleManualReanalyze() {
        setResumeActionLoading(true);
        setErrorMessage("");
        setStatusMessage(null);

        const targetRole = formData.preferredJobRole || profile?.preferredJobRole;
        const targetSpecs = formData.preferredSpecialization?.length
            ? formData.preferredSpecialization
            : profile?.preferredSpecialization;

        try {
            await dispatch(analyzeResume({
                preferredJobRole: targetRole,
                preferredSpecialization: targetSpecs
            })).unwrap();
            dispatch(fetchResumeAnalysis());
            setStatusMessage({
                type: "success",
                text: "Resume analysis recalculated successfully with your current resume!"
            });
        } catch (err) {
            setErrorMessage(typeof err === "string" ? err : err?.message || "Failed to analyze resume.");
        } finally {
            setResumeActionLoading(false);
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

    // Account: Delete User Account Permanently
    async function handleDeleteAccount() {
        setDeleteAccountLoading(true);
        setErrorMessage("");
        setStatusMessage(null);

        try {
            await dispatch(deleteUserAccount()).unwrap();
            dispatch(logout());
            navigate("/login");
        } catch (err) {
            setErrorMessage(typeof err === "string" ? err : err?.message || "Failed to delete account.");
            setShowDeleteAccountModal(false);
        } finally {
            setDeleteAccountLoading(false);
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
            <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-brand-primary/20 shrink-0">
                            {userInitial}
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-bold text-text-primary">
                                {user?.username || "Student"}
                            </h2>
                            <p className="text-xs sm:text-sm text-text-muted">
                                {user?.email || "user@careerguru.ai"}
                            </p>
                        </div>
                    </div>

                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-primary/20 transition-all duration-200 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-subtle text-brand-primary text-xs font-bold uppercase tracking-wider border border-brand-primary/20">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Editing Mode</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Form (Read / Edit) */}
            <form onSubmit={handleSaveProfile} className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-xs space-y-7">
                <div className="border-b border-border-default pb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-text-primary">
                            Professional & Career Preferences
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            {isEditing
                                ? "Update your career details below. Click save to persist your preferences."
                                : "Review your current candidate background and target career trajectory."}
                        </p>
                    </div>

                    {isEditing && careerTargetChanged && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-warning-subtle text-status-warning border border-status-warning-border animate-pulse flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Target Change Detected</span>
                        </span>
                    )}
                </div>

                {/* Warning Alert if Target Role or Specialization is modified in Edit Mode */}
                {isEditing && careerTargetChanged && (
                    <div className="p-4 rounded-xl bg-status-warning-subtle border border-status-warning-border flex items-start gap-3">
                        <svg className="w-5 h-5 text-status-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-xs text-text-secondary leading-relaxed">
                            <strong className="text-text-primary">Note on Career Target Updates:</strong> Changing your Preferred Job Role or Specialization will automatically reset your existing <strong>Learning Plan</strong> and <strong>Interview Questions</strong> so you can generate fresh curricula tailored to this focus. Your <strong>Resume Analysis</strong> will be automatically recalculated on the fly.
                        </div>
                    </div>
                )}

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Username */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Candidate Name
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleFieldChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-bg-muted/40 border border-border-default text-xs sm:text-sm font-medium text-text-primary">
                                {user?.username || "Not specified"}
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Phone Number
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFieldChange}
                                placeholder="+91 9876543210"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-bg-muted/40 border border-border-default text-xs sm:text-sm font-medium text-text-primary">
                                {user?.phone || "No phone number added"}
                            </div>
                        )}
                    </div>

                    {/* Education */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Highest Education
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleFieldChange}
                                placeholder="e.g. B.Tech Computer Science"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-bg-muted/40 border border-border-default text-xs sm:text-sm font-medium text-text-primary">
                                {profile?.education || "Not specified"}
                            </div>
                        )}
                    </div>

                    {/* Experience */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
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
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-bg-muted/40 border border-border-default text-xs sm:text-sm font-medium text-text-primary">
                                {profile?.experience !== undefined ? `${profile.experience} Years` : "0 Years"}
                            </div>
                        )}
                    </div>

                    {/* Preferred Job Role */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Preferred Job Role
                        </label>
                        {isEditing ? (
                            <select
                                name="preferredJobRole"
                                value={formData.preferredJobRole}
                                onChange={handleFieldChange}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary transition-colors cursor-pointer"
                            >
                                {jobRoles.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label} ({role.value})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="p-3 rounded-xl bg-bg-muted/40 border border-border-default flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-subtle text-brand-primary border border-brand-primary/20 shadow-2xs">
                                    {profile?.preferredJobRole || "Not specified"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Preferred Location */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                            Preferred Location
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="preferredLocation"
                                value={formData.preferredLocation}
                                onChange={handleFieldChange}
                                placeholder="e.g. Bangalore, Remote"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-bg-muted/40 border border-border-default text-xs sm:text-sm font-medium text-text-primary flex items-center gap-2">
                                <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{profile?.preferredLocation || "Not specified"}</span>
                            </div>
                        )}
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                            LinkedIn Profile URL
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleFieldChange}
                                placeholder="https://linkedin.com/in/yourprofile"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-app text-text-primary text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-subtle focus:border-brand-primary transition-colors"
                            />
                        ) : (
                            <div className="p-3 rounded-xl bg-bg-muted/40 border border-border-default text-xs sm:text-sm font-medium text-text-primary">
                                {profile?.linkedin ? (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-primary hover:underline inline-flex items-center gap-1 font-semibold"
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
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                                Preferred Specializations
                            </label>
                            {isEditing && (
                                <span className="text-[11px] text-text-muted">
                                    Click to select/deselect technical focus areas
                                </span>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="p-4 rounded-xl bg-bg-app border border-border-default space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {availableSpecializations.map((spec) => {
                                        const isSelected = formData.preferredSpecialization.includes(spec);
                                        return (
                                            <button
                                                key={spec}
                                                type="button"
                                                onClick={() => toggleSpecialization(spec)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                                                    isSelected
                                                        ? "bg-brand-primary text-white shadow-xs"
                                                        : "bg-bg-muted text-text-secondary hover:bg-bg-surface border border-border-default"
                                                }`}
                                            >
                                                <span>{isSelected ? "✓" : "+"}</span>
                                                <span>{spec}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {availableSpecializations.length === 0 && (
                                    <p className="text-xs text-text-muted">
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
                                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20 flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span>{spec} Focus</span>
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-text-muted">
                                        No preferred specializations selected.
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Mode Save / Cancel Buttons */}
                {isEditing && (
                    <div className="pt-4 border-t border-border-default flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-text-secondary hover:bg-bg-muted border border-border-default transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
            <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-default">
                    <div>
                        <h3 className="text-base font-bold text-text-primary">
                            Resume Document & Analysis Engine
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
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
                    <div className="p-5 rounded-xl bg-bg-app border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-status-danger-subtle text-status-danger flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                                PDF
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-text-primary truncate max-w-xs sm:max-w-md">
                                    {userResume.fileName || "Uploaded Resume.pdf"}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                                    {userResume.updatedAt && (
                                        <span>
                                            Updated {new Date(userResume.updatedAt).toLocaleDateString()}
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
                                className="px-3.5 py-2 rounded-xl bg-bg-muted hover:bg-bg-surface text-text-secondary text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-border-default"
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
                                className="px-3.5 py-2 rounded-xl bg-brand-subtle hover:bg-brand-primary/15 text-brand-primary border border-brand-primary/20 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                                className="px-3.5 py-2 rounded-xl text-status-danger hover:bg-status-danger-subtle text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 rounded-xl bg-bg-app border border-dashed border-border-default text-center space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-bold text-text-primary">
                                No Resume Uploaded Yet
                            </h4>
                            <p className="text-xs text-text-muted max-w-sm mx-auto">
                                Upload your PDF resume to generate an instant ATS score, identify missing skills, and unlock tailored interview challenges.
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={resumeActionLoading}
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-primary/20 transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>{resumeActionLoading ? "Uploading & Analyzing..." : "Upload Resume (PDF)"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Resume ATS Analysis & Insights Report */}
            {resumeActionLoading ? (
                <div className="bg-bg-surface border border-brand-primary/30 rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-4 animate-pulse">
                    <div className="w-12 h-12 rounded-xl bg-brand-subtle text-brand-primary mx-auto flex items-center justify-center">
                        <svg className="w-6 h-6 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-base font-bold text-text-primary">
                            Analyzing New Resume with AI Engine...
                        </h4>
                        <p className="text-xs text-text-muted max-w-md mx-auto">
                            Extracting candidate qualifications, benchmarking ATS compatibility against {formData.preferredJobRole || profile?.preferredJobRole}, and identifying skill coverage.
                        </p>
                    </div>
                </div>
            ) : analysisData?.roleAnalysis ? (
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-default">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-subtle text-brand-primary border border-brand-primary/20 mb-1">
                                <span>Resume Intelligence</span>
                            </div>
                            <h3 className="text-base font-bold text-text-primary">
                                ATS Resume Analysis & Skill Benchmarking
                            </h3>
                            <p className="text-xs text-text-muted mt-0.5">
                                Evaluated for <strong className="text-text-primary">{analysisData.roleAnalysis.role}</strong>
                                {analysisData.roleAnalysis.specialization && ` • ${analysisData.roleAnalysis.specialization}`}
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={resumeActionLoading}
                            onClick={handleManualReanalyze}
                            className="px-3.5 py-1.5 rounded-xl bg-bg-muted hover:bg-bg-surface text-text-secondary text-xs font-semibold border border-border-default transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Re-analyze</span>
                        </button>
                    </div>

                    {/* ATS Score & Match Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-bg-app p-5 rounded-2xl border border-border-default">
                        {/* ATS Score Dial / Badge */}
                        <div className="flex items-center gap-4 sm:border-r sm:border-border-default sm:pr-4">
                            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-xl shadow-md ${
                                analysisData.roleAnalysis.atsScore >= 80
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                    : analysisData.roleAnalysis.atsScore >= 60
                                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            }`}>
                                <span>{analysisData.roleAnalysis.atsScore}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider -mt-1 opacity-70">ATS</span>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                    Match Rating
                                </span>
                                <h4 className="text-sm font-bold text-text-primary">
                                    {analysisData.roleAnalysis.atsScore >= 80
                                        ? "Excellent Fit"
                                        : analysisData.roleAnalysis.atsScore >= 65
                                        ? "Strong Match"
                                        : analysisData.roleAnalysis.atsScore >= 50
                                        ? "Moderate Match"
                                        : "Needs Optimization"}
                                </h4>
                                <p className="text-[11px] text-text-muted">
                                    {analysisData.roleAnalysis.atsScore >= 75
                                        ? "High probability of passing ATS filters"
                                        : "Review skill gaps below to boost score"}
                                </p>
                            </div>
                        </div>

                        {/* Target Focus */}
                        <div className="space-y-1 sm:px-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Target Role
                            </span>
                            <div className="font-semibold text-xs sm:text-sm text-text-primary truncate">
                                {analysisData.roleAnalysis.role || "Software Engineer"}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {analysisData.roleAnalysis.specialization?.split(",").map((s, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-subtle text-brand-primary border border-brand-primary/20">
                                        {s.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions Links */}
                        <div className="flex flex-col gap-2 sm:pl-2">
                            <Link
                                to="/user/dashboard"
                                className="px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold text-center transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>Full Dashboard Metrics</span>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <Link
                                to="/user/learning-plan"
                                className="px-3.5 py-2 rounded-xl bg-bg-surface hover:bg-bg-muted text-text-primary text-xs font-semibold text-center border border-border-default transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <span>Learning Roadmap</span>
                            </Link>
                        </div>
                    </div>

                    {/* Strengths & Missing Skills Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Strengths */}
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                    Identified Resume Strengths
                                </h4>
                            </div>
                            <ul className="space-y-1.5">
                                {(analysisData.roleAnalysis.strengths || []).slice(0, 4).map((str, idx) => (
                                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                                        <span className="leading-relaxed">{str}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Missing Skills */}
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                    Missing Skills for Target Role
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {(analysisData.roleAnalysis.missingSkills || []).length > 0 ? (
                                    analysisData.roleAnalysis.missingSkills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25"
                                        >
                                            + {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-text-muted">
                                        No critical skills missing for this specialization!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actionable Suggestions */}
                    {Array.isArray(analysisData.roleAnalysis.suggestions) && analysisData.roleAnalysis.suggestions.length > 0 && (
                        <div className="p-4 rounded-xl bg-bg-app border border-border-default space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                                <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Tailored Recommendations for Your Resume</span>
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {analysisData.roleAnalysis.suggestions.slice(0, 4).map((sug, idx) => (
                                    <li key={idx} className="text-xs text-text-secondary flex items-start gap-2 bg-bg-surface p-2.5 rounded-lg border border-border-default">
                                        <span className="text-brand-primary font-bold shrink-0">{idx + 1}.</span>
                                        <span className="leading-relaxed">{sug}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ) : userResume && userResume.filePath && !dashboardLoading ? (
                <div className="p-6 rounded-2xl bg-bg-surface border border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-xs">
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-text-primary">
                            Ready for AI Resume Analysis
                        </h4>
                        <p className="text-xs text-text-muted">
                            Your resume is stored. Run analysis to benchmark your score against {formData.preferredJobRole || profile?.preferredJobRole}.
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={resumeActionLoading}
                        onClick={handleManualReanalyze}
                        className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <span>{resumeActionLoading ? "Analyzing..." : "Analyze Resume"}</span>
                    </button>
                </div>
            ) : null}

            {/* Danger Zone: Delete Account */}
            <div className="p-6 sm:p-8 rounded-2xl bg-bg-surface border border-status-danger-border shadow-xs space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-status-danger animate-pulse"></span>
                            <h3 className="text-base font-bold text-status-danger">
                                Danger Zone: Delete Account
                            </h3>
                        </div>
                        <p className="text-xs text-text-secondary max-w-xl leading-relaxed">
                            Permanently delete your user account and erase all associated data from the platform, including your profile, resume files, ATS analysis, learning plans, interview question sets, completed assessments, and mentor chat history.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowDeleteAccountModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-status-danger hover:bg-red-700 text-white text-xs font-semibold shadow-xs hover:shadow-red-600/20 transition-all cursor-pointer shrink-0"
                    >
                        Delete My Account
                    </button>
                </div>
            </div>

            {/* Delete Resume Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-left">
                        <div className="w-11 h-11 rounded-xl bg-status-danger-subtle text-status-danger flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-text-primary">
                                Delete Uploaded Resume?
                            </h3>
                            <p className="text-xs text-text-secondary leading-relaxed">
                                This will permanently remove your stored PDF resume and delete your current ATS resume analysis. Your dashboard will prompt you to add a resume until a new one is uploaded.
                            </p>
                        </div>
                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-muted transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={resumeActionLoading}
                                onClick={handleDeleteResume}
                                className="px-4 py-2 rounded-xl bg-status-danger hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {resumeActionLoading ? "Deleting..." : "Yes, Delete Resume"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteAccountModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-bg-surface border border-status-danger-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-left">
                        <div className="w-12 h-12 rounded-xl bg-status-danger-subtle text-status-danger flex items-center justify-center">
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-bold text-text-primary">
                                Are you absolutely sure?
                            </h3>
                            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                                This action is irreversible. All of your data will be permanently wiped from the database and Cloudinary storage:
                            </p>
                            <ul className="text-xs text-text-muted list-disc list-inside space-y-1 pt-1">
                                <li>Account credentials and user profile</li>
                                <li>Uploaded resume files & ATS scoring reports</li>
                                <li>Custom course learning roadmaps</li>
                                <li>Mock interview recordings & evaluations</li>
                                <li>Mentor conversations and messages</li>
                            </ul>
                        </div>

                        <div className="pt-3 flex items-center justify-end gap-3 border-t border-border-default">
                            <button
                                type="button"
                                disabled={deleteAccountLoading}
                                onClick={() => setShowDeleteAccountModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-muted transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={deleteAccountLoading}
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 rounded-xl bg-status-danger hover:bg-red-700 text-white text-xs font-bold shadow-xs hover:shadow-red-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleteAccountLoading ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Deleting Account...</span>
                                    </>
                                ) : (
                                    <span>Yes, Permanently Delete</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}