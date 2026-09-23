import { useNavigate } from "react-router-dom";

export default function MentorAssessment() {
    const navigate = useNavigate();

    function handleManualAssessment() {
        navigate("/mentor/assessment/manual");
    }

    function handleAIAssessment() {
        navigate("/mentor/assessment/ai");
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto text-left space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                    Assessment Creation
                </h1>
                <p className="text-sm text-text-secondary">
                    Choose how you want to configure and assign structured interview assessments for your mentees.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                {/* Manual Assessment */}
                <div className="flex flex-col justify-between p-6 sm:p-8 bg-bg-surface border border-border-default rounded-xl shadow-subtle hover:shadow-card transition-all duration-200">
                    <div className="space-y-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-bg-muted text-text-primary flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">
                            Manually Create Assessment
                        </h2>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            Write your custom questions step-by-step and configure assessment timing and criteria manually.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleManualAssessment}
                        className="w-full py-2.5 px-4 bg-bg-muted hover:bg-border-strong text-text-primary text-xs sm:text-sm font-semibold rounded-lg border border-border-default transition cursor-pointer text-center"
                    >
                        Create Manually
                    </button>
                </div>

                {/* AI Assessment */}
                <div className="flex flex-col justify-between p-6 sm:p-8 bg-bg-surface border border-border-default hover:border-brand-primary/50 rounded-xl shadow-subtle hover:shadow-card transition-all duration-200">
                    <div className="space-y-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-brand-subtle text-brand-primary flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-text-primary">
                            Generate Assessment by AI
                        </h2>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            Automatically curate tailored questions based on student's target role, topic, and difficulty level.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAIAssessment}
                        className="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer text-center"
                    >
                        Generate with AI
                    </button>
                </div>
            </div>
        </div>
    );
}
