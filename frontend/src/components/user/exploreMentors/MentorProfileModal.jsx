import { useEffect } from "react";

export default function MentorProfileModal({ mentor, onClose, onTalkToMentor }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    if (!mentor) return null;

    const initial = mentor.name?.charAt(0).toUpperCase() || "M";

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mentor-profile-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
            <div className="relative w-full max-w-xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left transition-colors duration-300">
                {/* Modal Header */}
                <div className="p-5 sm:p-6 flex items-start gap-4 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {initial}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <h3
                            id="mentor-profile-title"
                            className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate"
                        >
                            {mentor.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-indigo-900/90 dark:text-indigo-400 truncate mt-0.5">
                            {mentor.designation || "Senior Technical Mentor"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {mentor.organization || mentor.origin || "Industry Veteran"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-left text-xs sm:text-sm">
                    {/* About Section */}
                    {mentor.bio && (
                        <div className="space-y-1.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                                About Mentor
                            </h4>
                            <p className="text-slate-700 dark:text-zinc-300 leading-relaxed">
                                {mentor.bio}
                            </p>
                        </div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Experience
                            </span>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                                {mentor.experience !== undefined && mentor.experience !== null
                                    ? `${mentor.experience} Years`
                                    : "Experienced"}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Work Type
                            </span>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                                {mentor.workType || "Full-time"}
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800 col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Education
                            </span>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                                {mentor.education || "Bachelor's Degree"}
                            </div>
                        </div>
                    </div>

                    {/* Expert In Section */}
                    {Array.isArray(mentor.expertIn) && mentor.expertIn.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                                Core Expertise
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {mentor.expertIn.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-zinc-800 text-indigo-900 dark:text-zinc-300 border border-indigo-100 dark:border-zinc-700"
                                    >
                                        ⭐ {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Specialization Section */}
                    {Array.isArray(mentor.specialization) && mentor.specialization.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                                Technical Specialization
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {mentor.specialization.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-950/60 text-slate-700 dark:text-zinc-300 border border-[#E2E8F0] dark:border-zinc-800"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {Array.isArray(mentor.languages) && mentor.languages.length > 0 && (
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500">
                                Languages
                            </h4>
                            <p className="text-xs text-slate-700 dark:text-zinc-300">
                                💬 {mentor.languages.join(", ")}
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-[#E2E8F0]/80 dark:border-zinc-800 flex items-center justify-end gap-3 bg-[#F8FAFC]/50 dark:bg-zinc-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            if (onTalkToMentor) onTalkToMentor();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Talk to Mentor</span>
                    </button>
                </div>
            </div>
        </div>
    );
}