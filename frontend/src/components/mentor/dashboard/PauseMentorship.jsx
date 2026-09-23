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
        <div className="bg-bg-surface border border-border-default rounded-xl p-6 transition-all duration-200 shadow-subtle text-left flex-1 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-default">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-text-primary">
                            Mentorship Status
                        </h3>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isAvailable
                                ? "bg-status-success-subtle text-status-success border border-status-success/20"
                                : "bg-status-warning-subtle text-status-warning border border-status-warning/20"
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${
                                isAvailable ? "bg-status-success animate-pulse" : "bg-status-warning"
                            }`}
                        />
                        {isAvailable ? "Active" : "Paused"}
                    </span>
                </div>

                <div className="py-5 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-text-primary">
                            {isAvailable ? "Accepting New Mentees" : "Mentorship Paused"}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
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
                            isAvailable ? "bg-status-success" : "bg-bg-muted"
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

            <div className="p-3 rounded-lg bg-bg-muted/60 border border-border-default text-xs text-text-secondary leading-relaxed">
                {isAvailable ? (
                    <>
                        <strong className="text-text-primary">You are visible</strong> to prospective mentees. Students can message and schedule sessions with you.
                    </>
                ) : (
                    <>
                        <strong className="text-text-primary">You are hidden</strong> from Explore Mentors. Existing mentees can still message you normally.
                    </>
                )}
            </div>
        </div>
    );
}
