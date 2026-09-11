import { useDispatch, useSelector } from "react-redux";
import { updateAvailability } from "../../../slices/mentor/MentorDashboardSlice";

export default function PauseMentorship() {
    const dispatch = useDispatch();
    const { availability, updatingAvailability } = useSelector((state) => state.mentorDashboard);

    const isAvailable = availability?.isAvailable ?? true;

    function handleToggle() {
        dispatch(updateAvailability(!isAvailable));
    }

    return (
        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 transition-all duration-300 shadow-xs text-left flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-zinc-300 flex items-center justify-center shrink-0 text-sm">
                            ⚡
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Mentorship Status
                        </h3>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isAvailable
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                                : "bg-indigo-50/60 text-indigo-600 dark:bg-amber-950/40 dark:text-amber-400 border border-indigo-100 dark:border-amber-800/60"
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${
                                isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                            }`}
                        />
                        {isAvailable ? "Active" : "Paused"}
                    </span>
                </div>

                <div className="py-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {isAvailable ? "Accepting New Mentees" : "Mentorship Paused"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            {isAvailable
                                ? "Visible to students on Explore Mentors"
                                : "Hidden from search results"}
                        </p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isAvailable}
                        disabled={updatingAvailability}
                        onClick={handleToggle}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:opacity-50 ${
                            isAvailable ? "bg-emerald-600 dark:bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700"
                        }`}
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isAvailable ? "translate-x-5" : "translate-x-0"
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-zinc-800/50 border border-indigo-100 dark:border-zinc-700/60 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {isAvailable ? (
                    <>
                        <strong className="text-slate-900 dark:text-zinc-200">You are visible</strong> to prospective mentees. Students can message and schedule sessions with you.
                    </>
                ) : (
                    <>
                        <strong className="text-slate-900 dark:text-zinc-200">You are hidden</strong> from Explore Mentors. Existing mentees can still message you normally.
                    </>
                )}
            </div>
        </div>
    );
}

