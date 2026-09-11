import { useSelector } from "react-redux";
import { useState } from "react";

export default function Questions() {
    const [showAnswer, setShowAnswer] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const { data } = useSelector((state) => {
        return state.interviewQuestions;
    });

    function handleShowAnswer(id) {
        if (showAnswer === id) {
            setShowAnswer(null);
        } else {
            setShowAnswer(id);
        }
    }

    function handleCopyAnswer(answerArray, id) {
        if (navigator.clipboard) {
            const fullText = answerArray.join("\n• ");
            navigator.clipboard.writeText(`• ${fullText}`);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    }

    const questions = data?.questions || [];

    const getDifficultyBadge = (difficulty) => {
        const diff = (difficulty || "").toLowerCase();
        if (diff === "beginner") {
            return "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50";
        }
        if (diff === "advanced") {
            return "bg-purple-100/80 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/50";
        }
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50";
    };

    if (questions.length === 0) {
        return (
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-2xl p-8 text-center text-slate-500 dark:text-zinc-400 text-xs">
                No interview questions found for this configuration.
            </div>
        );
    }

    return (
        <div className="space-y-4 text-left">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/80 dark:border-zinc-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                    {questions.length} Question{questions.length === 1 ? "" : "s"} Curated
                </span>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Click any question to view the model response
                </span>
            </div>

            {/* Questions Accordion Cards */}
            <div className="space-y-3.5">
                {questions.map((ele, index) => {
                    const isOpen = showAnswer === ele._id;

                    return (
                        <div
                            key={ele._id || index}
                            className={`bg-[#FFFFFF] dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 overflow-hidden ${
                                isOpen
                                    ? "border-indigo-400 dark:border-indigo-500 shadow-sm"
                                    : "border-[#E2E8F0] dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700"
                            }`}
                        >
                            {/* Question Header Button */}
                            <button
                                type="button"
                                onClick={() => handleShowAnswer(ele._id)}
                                className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer group"
                            >
                                <div className="space-y-2.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                            Q{index + 1 < 10 ? `0${index + 1}` : index + 1}
                                        </span>

                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getDifficultyBadge(ele.difficulty)}`}>
                                            {ele.difficulty || "standard"}
                                        </span>
                                    </div>

                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                                        {ele.question}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-1">
                                    <span className="hidden sm:inline text-xs font-semibold text-slate-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                        {isOpen ? "Hide Answer" : "View Answer"}
                                    </span>
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50/60 dark:bg-zinc-800 flex items-center justify-center border border-indigo-100 dark:border-zinc-700/60 group-hover:bg-indigo-100/70 dark:group-hover:bg-zinc-700 transition-colors">
                                        <svg
                                            className={`w-4 h-4 text-slate-600 dark:text-zinc-300 transition-transform duration-200 ${
                                                isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {/* Collapsible Model Answer */}
                            {isOpen && (
                                <div className="px-5 sm:px-6 pb-6 pt-2 bg-indigo-50/60 dark:bg-zinc-950/60 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80 space-y-4 text-left">
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Model Answer & Talking Points
                                        </span>

                                        {Array.isArray(ele.answer) && ele.answer.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleCopyAnswer(ele.answer, ele._id)}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                                                title="Copy talking points"
                                            >
                                                {copiedId === ele._id ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {Array.isArray(ele.answer) ? (
                                        <ul className="space-y-2.5">
                                            {ele.answer.map((item, aIdx) => (
                                                <li
                                                    key={aIdx}
                                                    className="flex items-start gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-[#E2E8F0]/60 dark:border-zinc-800/60 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed shadow-2xs"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                                            {ele.answer}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}