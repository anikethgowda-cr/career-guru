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
            return "bg-status-success-subtle text-status-success border border-status-success/20";
        }
        if (diff === "advanced") {
            return "bg-status-warning-subtle text-status-warning border border-status-warning/20";
        }
        return "bg-brand-subtle text-brand-primary border border-brand-primary/20";
    };

    if (questions.length === 0) {
        return (
            <div className="bg-bg-surface border border-border-default rounded-xl p-8 text-center text-text-muted text-xs shadow-subtle">
                No interview questions found for this configuration.
            </div>
        );
    }

    return (
        <div className="space-y-4 text-left">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-border-default">
                <span className="text-xs font-semibold text-text-secondary">
                    {questions.length} Question{questions.length === 1 ? "" : "s"} Curated
                </span>
                <span className="text-[11px] text-text-muted">
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
                            className={`bg-bg-surface border rounded-xl shadow-subtle transition-all duration-200 overflow-hidden ${
                                isOpen
                                    ? "border-brand-primary/60 shadow-card"
                                    : "border-border-default hover:border-border-strong"
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
                                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-bg-muted text-text-secondary border border-border-default">
                                            Q{index + 1 < 10 ? `0${index + 1}` : index + 1}
                                        </span>

                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getDifficultyBadge(ele.difficulty)}`}>
                                            {ele.difficulty || "standard"}
                                        </span>
                                    </div>

                                    <h3 className="text-sm sm:text-base font-bold text-text-primary group-hover:text-brand-primary transition-colors leading-snug">
                                        {ele.question}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 pt-1">
                                    <span className="hidden sm:inline text-xs font-medium text-text-muted group-hover:text-brand-primary">
                                        {isOpen ? "Hide Answer" : "View Answer"}
                                    </span>
                                    <div className="w-8 h-8 rounded-lg bg-bg-muted flex items-center justify-center border border-border-default group-hover:border-brand-primary/40 transition-colors">
                                        <svg
                                            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
                                                isOpen ? "rotate-180 text-brand-primary" : ""
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {/* Collapsible Model Answer */}
                            {isOpen && (
                                <div className="px-5 sm:px-6 pb-6 pt-2 bg-bg-muted/40 border-t border-border-default space-y-4 text-left">
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs font-bold text-text-primary flex items-center gap-2">
                                            <svg className="w-4 h-4 text-status-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Model Answer & Talking Points
                                        </span>

                                        {Array.isArray(ele.answer) && ele.answer.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => handleCopyAnswer(ele.answer, ele._id)}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-surface border border-border-default shadow-xs hover:bg-bg-muted transition-all cursor-pointer"
                                                title="Copy talking points"
                                            >
                                                {copiedId === ele._id ? (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="text-status-success">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
                                                    className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface border border-border-default text-xs sm:text-sm text-text-secondary leading-relaxed shadow-xs"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-status-success mt-2 shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-text-secondary">
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