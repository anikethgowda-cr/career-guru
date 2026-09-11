import { useNavigate } from "react-router-dom";

export default function MenteeCard({ mentee, studentId }) {
    const navigate = useNavigate();

    const { conversationId, student, profile } = mentee;
    const initial = student?.username?.charAt(0).toUpperCase() || "S";

    function handleViewChat() {
        navigate(`/mentor/chat/${conversationId}`);
    }

    function handleViewReport() {
        navigate(`/mentor/mentees/report/${studentId}`);
    }

    return (
        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between text-left group">
            <div className="space-y-5">
                {/* Header: Avatar, Name, Email */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-600/20 dark:shadow-indigo-600/30 shrink-0">
                        {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                                {student?.username || "Unknown Student"}
                            </h2>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-300 shrink-0">
                                Student
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            {student?.email || "No email available"}
                        </p>
                    </div>
                </div>

                {profile ? (
                    <>
                        {/* 4-Grid Info Block */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800/50 border border-indigo-100 dark:border-zinc-700/60">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-0.5">
                                    Education
                                </span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate block">
                                    {profile.education || "Not specified"}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800/50 border border-indigo-100 dark:border-zinc-700/60">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-0.5">
                                    Experience
                                </span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate block">
                                    {profile.experience !== undefined && profile.experience !== null
                                        ? `${profile.experience} Yrs`
                                        : "0 Yrs"}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800/50 border border-indigo-100 dark:border-zinc-700/60">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-0.5">
                                    Target Role
                                </span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate block">
                                    {profile.preferredJobRole || "Not specified"}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800/50 border border-indigo-100 dark:border-zinc-700/60">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-0.5">
                                    Location
                                </span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate block">
                                    {profile.preferredLocation || "Flexible"}
                                </span>
                            </div>
                        </div>

                        {/* Specializations */}
                        {profile.preferredSpecialization?.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
                                    Specializations:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {profile.preferredSpecialization.map((item, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-zinc-800 border border-indigo-100 dark:border-zinc-700 text-slate-800 dark:text-zinc-300 text-[11px] font-medium"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800/40 border border-dashed border-indigo-100 dark:border-zinc-700 text-center">
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Student profile is pending initial setup.
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="pt-5 mt-5 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80 flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleViewReport}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:hover:from-indigo-500 dark:hover:to-indigo-600 text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer text-center"
                >
                    View Report
                </button>

                <button
                    type="button"
                    onClick={handleViewChat}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-900 dark:text-zinc-200 text-xs font-semibold border border-indigo-100 dark:border-zinc-700 transition-colors cursor-pointer text-center"
                >
                    Chat
                </button>

                {profile?.linkedin && (
                    <a
                        href={profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 transition-colors shrink-0"
                        title="View LinkedIn Profile"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.88 0-1.6.72-1.6 1.6 0 .88.72 1.6 1.6 1.6.88 0 1.6-.72 1.6-1.6 0-.88-.72-1.6-1.6-1.6z" />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
}

