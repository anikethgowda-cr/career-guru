import { useEffect } from "react";

export default function MentorProfileModal({ mentor, onClose, onTalkToMentor, isSubscribed }) {
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
            className="fixed inset-0 z-50 bg-bg-overlay backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
            <div className="relative w-full max-w-xl bg-bg-surface border border-border-default rounded-xl shadow-dropdown flex flex-col max-h-[90vh] overflow-hidden text-left transition-colors duration-200">
                {/* Modal Header */}
                <div className="p-5 sm:p-6 flex items-start gap-4 border-b border-border-default">
                    <div className="w-13 h-13 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                        {initial}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <h3
                            id="mentor-profile-title"
                            className="text-lg sm:text-xl font-bold text-text-primary truncate"
                        >
                            {mentor.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-brand-primary truncate mt-0.5">
                            {mentor.designation || "Senior Technical Mentor"}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                            {mentor.organization || mentor.origin || "Industry Veteran"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors cursor-pointer shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-left text-xs sm:text-sm">
                    {/* About Section */}
                    {mentor.bio && (
                        <div className="space-y-1.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                About Mentor
                            </h4>
                            <p className="text-text-secondary leading-relaxed">
                                {mentor.bio}
                            </p>
                        </div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-bg-muted/60 border border-border-default">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                Experience
                            </span>
                            <div className="text-sm font-bold text-text-primary mt-0.5">
                                {mentor.experience !== undefined && mentor.experience !== null
                                    ? `${mentor.experience} Years`
                                    : "Experienced"}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-bg-muted/60 border border-border-default">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                Work Type
                            </span>
                            <div className="text-sm font-bold text-text-primary mt-0.5 capitalize">
                                {mentor.workType || "Full-time"}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-bg-muted/60 border border-border-default col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                                Education
                            </span>
                            <div className="text-sm font-bold text-text-primary mt-0.5 truncate">
                                {mentor.education || "Bachelor's Degree"}
                            </div>
                        </div>
                    </div>

                    {/* Expert In Section */}
                    {Array.isArray(mentor.expertIn) && mentor.expertIn.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Core Expertise
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {mentor.expertIn.map((item, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-brand-subtle text-brand-primary border border-brand-primary/20"
                                    >
                                        <svg className="w-3.5 h-3.5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Specialization Section */}
                    {Array.isArray(mentor.specialization) && mentor.specialization.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Technical Specialization
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {mentor.specialization.map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-bg-muted text-text-secondary border border-border-default"
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
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                Languages
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                <svg className="w-3.5 h-3.5 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                <span>{mentor.languages.join(", ")}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-border-default flex items-center justify-end gap-3 bg-bg-muted/30">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-muted border border-border-default transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            if (onTalkToMentor) onTalkToMentor();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{isSubscribed ? "Chat with Mentor" : "Subscribe to Talk"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}