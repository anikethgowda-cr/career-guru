import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { uploadResume, analyzeResume } from "../../slices/user/ResumeSlice";
import { createProfile } from "../../slices/ProfileSlice";
import { jobRoles, specializations } from "../../constants/jobOptions";

export default function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user, loading: authLoading } = useSelector((state) => {
        return state.auth;
    });

    const { uploadLoading, uploadSuccess, uploadError, analysisLoading, analysisError } = useSelector((state) => {
        return state.resume;
    });

    const { loading: profileLoading, error: profileError } = useSelector((state) => {
        return state.profile;
    });
    
    const [formData, setFormData] = useState({ education: "", experience: "", preferredJobRole: "", preferredSpecialization: [], preferredLocation: "", linkedin: "" });
    const [resume, setResume] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
                <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400">
                    <svg className="w-6 h-6 animate-spin text-indigo-600" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">Loading session...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 max-w-sm w-full">
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-500 mx-auto flex items-center justify-center mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Unauthorized</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Please log in to set up your profile.</p>
                </div>
            </div>
        );
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
        } catch (err) {
            setError(err?.message || err || "Resume upload failed");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!formData.education.trim()) return setError("Education is required");
        if (!formData.experience.trim()) return setError("Experience is required");
        if (!formData.preferredJobRole) return setError("Preferred job role is required");
        if (!formData.preferredSpecialization.length) return setError("Please select at least one specialization");
        if (!formData.preferredLocation.trim()) return setError("Preferred location is required");
        if (!uploadSuccess) return setError("Please upload your resume first");

        try {
            await dispatch(analyzeResume({ preferredJobRole: formData.preferredJobRole, preferredSpecialization: formData.preferredSpecialization })).unwrap();
            await dispatch(createProfile({profileData:formData, role: user?.role})).unwrap();
            navigate("/user/dashboard");
        } catch (err) {
            setError(err?.message || err || "Something went wrong");
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-10">
                
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-2">
                        <span>Career Profile</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Complete Your Profile
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        Tell us about your background and goals so CareerGuru can personalize your learning roadmap.
                    </p>
                </div>

                {/* Error Notices */}
                {(error || profileError || analysisError) && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-sm text-red-600 dark:text-red-400 space-y-1">
                        {error && <p className="flex items-center gap-2"><span>•</span> {error}</p>}
                        {profileError && <p className="flex items-center gap-2"><span>•</span> {profileError?.message || profileError}</p>}
                        {analysisError && <p className="flex items-center gap-2"><span>•</span> {analysisError?.message || analysisError}</p>}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Readonly Username */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            value={user?.username || ""}
                            readOnly
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 text-sm cursor-not-allowed font-medium"
                        />
                    </div>

                    {/* Education & Experience in a 2-Col Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                                Education <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="education"
                                value={formData.education}
                                onChange={handleFormData}
                                placeholder="e.g. B.Tech Computer Science"
                                required
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                                Experience (Years) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleFormData}
                                placeholder="e.g. 0 for fresher, 2 for 2 yrs"
                                min="0"
                                required
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                            />
                        </div>
                    </div>

                    {/* Preferred Job Role */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                            Preferred Job Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="preferredJobRole"
                            value={formData.preferredJobRole}
                            onChange={handleFormData}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors cursor-pointer"
                        >
                            <option value="">Select Job Role</option>
                            {jobRoles.map((role, index) => {
                                const roleValue = typeof role === "object" ? role.value : role;
                                const roleLabel = typeof role === "object" ? role.label : role;
                                return (
                                    <option key={roleValue || index} value={roleValue} className="dark:bg-zinc-900">
                                        {roleLabel}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Preferred Specialization Multi-select */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300">
                                Preferred Specializations <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                                Hold Ctrl (Win) or Cmd (Mac) to select multiple
                            </span>
                        </div>
                        <select
                            name="preferredSpecialization"
                            multiple
                            value={formData.preferredSpecialization}
                            onChange={handleFormData}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors min-h-[110px]"
                        >
                            {formData.preferredJobRole && specializations[formData.preferredJobRole]?.map((spec, index) => {
                                const specValue = typeof spec === "object" ? spec.value : spec;
                                const specLabel = typeof spec === "object" ? spec.label : spec;
                                return (
                                    <option key={specValue || index} value={specValue} className="p-1.5 dark:bg-zinc-900">
                                        {specLabel}
                                    </option>
                                );
                            })}
                        </select>
                        {!formData.preferredJobRole && (
                            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1.5">
                                Please choose a Job Role first to view available specializations.
                            </p>
                        )}
                    </div>

                    {/* Preferred Location & LinkedIn */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                                Preferred Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="preferredLocation"
                                value={formData.preferredLocation}
                                onChange={handleFormData}
                                placeholder="e.g. Bangalore, Remote"
                                required
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                                LinkedIn Profile
                            </label>
                            <input
                                type="text"
                                name="linkedin"
                                value={formData.linkedin}
                                onChange={handleFormData}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                            />
                        </div>
                    </div>

                    {/* Resume Upload Section */}
                    <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-200 mb-1">
                                Resume (PDF) <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                Upload your PDF resume so our AI can analyze your skillset.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleResume}
                                className="flex-1 text-sm text-slate-600 dark:text-zinc-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950/60 dark:file:text-indigo-400 hover:file:bg-indigo-100 cursor-pointer"
                            />
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={uploadLoading}
                                className="py-2 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-zinc-200 font-medium text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                            >
                                {uploadLoading ? "Uploading..." : "Upload Resume"}
                            </button>
                        </div>

                        {uploadSuccess && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Resume uploaded successfully!</span>
                            </div>
                        )}

                        {uploadError && (
                            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span>{uploadError?.message || uploadError}</span>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={analysisLoading || profileLoading || uploadLoading || !uploadSuccess}
                        className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    >
                        {(analysisLoading || profileLoading) && (
                            <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>
                            {analysisLoading ? "Analyzing Resume..." : profileLoading ? "Creating Profile..." : "Create Profile"}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}