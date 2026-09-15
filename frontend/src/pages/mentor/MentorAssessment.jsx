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
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto text-left">
            <div className="mb-8 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100">
                    Assessment
                </h1>
                <p className="text-sm text-slate-500 dark:text-zinc-400">
                    Choose how you want to create and assign assessments for your mentees.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                {/* Manual Assessment */}
                <div className="flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                    <div className="space-y-2 mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
                            Manually Create Assessment
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                            Write your own questions step-by-step and configure assessment details manually.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleManualAssessment}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded-xl transition cursor-pointer text-center"
                    >
                        Create Manually
                    </button>
                </div>

                {/* AI Assessment */}
                <div className="flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                    <div className="space-y-2 mb-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
                            Generate Assessment by AI
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">
                            Automatically generate relevant questions based on target role, topic, and difficulty.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleAIAssessment}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition cursor-pointer text-center"
                    >
                        Generate with AI
                    </button>
                </div>
            </div>
        </div>
    );
}
