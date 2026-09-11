import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorProfileModal from "./MentorProfileModal";

export default function MentorsCard({ mentor }) {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const initial = mentor.name?.charAt(0).toUpperCase() || "M";

    function handleTalkToMentor() {
        navigate(`/user/mentor/chat/${mentor.userId}`, {
            state: {
                mentorName: mentor.name,
                mentorInitial: initial
            }
        });
    }

    return (
        <>
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group text-left">
                <div className="space-y-4">
                    {/* Header: Avatar + Info */}
                    <div className="flex items-start gap-3.5">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                                {initial}
                            </div>
                            {/* Online badge */}
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#FFFFFF] dark:border-zinc-900"></span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3
                                title={mentor.name}
                                className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors"
                            >
                                {mentor.name}
                            </h3>
                            <p
                                title={mentor.designation}
                                className="text-xs sm:text-sm font-medium text-indigo-900/90 dark:text-indigo-400 truncate mt-0.5"
                            >
                                {mentor.designation || "Technical Mentor"}
                            </p>
                            <p
                                title={mentor.organization || mentor.origin}
                                className="text-xs text-slate-500 dark:text-zinc-400 truncate"
                            >
                                {mentor.organization || mentor.origin || "Industry Professional"}
                            </p>
                        </div>
                    </div>

                    {/* Stat Badges: Experience & Work Type */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-zinc-950/40 border border-[#E2E8F0]/80 dark:border-zinc-800/80 text-xs">
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                                Experience
                            </span>
                            <strong className="text-slate-800 dark:text-zinc-200 font-bold">
                                {mentor.experience !== undefined && mentor.experience !== null
                                    ? `${mentor.experience} Years`
                                    : "Experienced"}
                            </strong>
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                                Work Type
                            </span>
                            <strong className="text-slate-800 dark:text-zinc-200 font-bold capitalize truncate block">
                                {mentor.workType || "Full-time"}
                            </strong>
                        </div>
                    </div>

                    {/* Specialization Tags */}
                    {Array.isArray(mentor.specialization) && mentor.specialization.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Specialization
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {mentor.specialization.slice(0, 3).map((item, index) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-zinc-800 text-indigo-900 dark:text-zinc-300 border border-indigo-100 dark:border-zinc-700"
                                    >
                                        {item}
                                    </span>
                                ))}
                                {mentor.specialization.length > 3 && (
                                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                                        +{mentor.specialization.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {Array.isArray(mentor.languages) && mentor.languages.length > 0 && (
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 truncate">
                            <span className="text-slate-400 dark:text-zinc-500">💬</span>
                            <span className="truncate">{mentor.languages.join(", ")}</span>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 mt-4 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        View Profile
                    </button>

                    <button
                        type="button"
                        onClick={handleTalkToMentor}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Talk to Mentor</span>
                    </button>
                </div>
            </div>

            {showModal && (
                <MentorProfileModal
                    mentor={mentor}
                    onClose={() => setShowModal(false)}
                    onTalkToMentor={handleTalkToMentor}
                />
            )}
        </>
    );
}