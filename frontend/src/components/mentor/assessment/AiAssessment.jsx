import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchMentees,
    generateAiQuestions,
    createAiAssessment,
    clearMentorAssessmentState
} from "../../../slices/mentor/MentorAssessmentSlice";

export default function AiAssessment() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [questionsGeneration, setQuestionsGeneration] = useState({
        studentId: "",
        title: "",
        difficulty: "",
        targetRole: "",
        noOfQuestions: ""
    });

    const [aiQuestions, setAiQuestions] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedQuestion, setEditedQuestion] = useState("");
    const [newQuestion, setNewQuestion] = useState("");
    const [questionNumberError, setQuestionNumberError] = useState("");
    const [clientError, setClientError] = useState("");

    const {
        mentees,
        message,
        serverError,
        loading,
        isSubmitting,
        isGenerating
    } = useSelector((state) => state.mentorAssessment);

    useEffect(() => {
        dispatch(fetchMentees());
        return () => {
            dispatch(clearMentorAssessmentState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                dispatch(clearMentorAssessmentState());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, dispatch]);

    function handleFormData(e) {
        if (clientError) setClientError("");
        if (serverError) dispatch(clearMentorAssessmentState());
        setQuestionsGeneration((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    async function handleQuestionGeneration(e) {
        e.preventDefault();
        setQuestionNumberError("");
        setClientError("");
        dispatch(clearMentorAssessmentState());

        const noOfQuestions = parseInt(questionsGeneration.noOfQuestions, 10);
        if (isNaN(noOfQuestions) || noOfQuestions <= 3) {
            setQuestionNumberError("Number of questions must be greater than 3.");
            return;
        }

        if (!questionsGeneration.title.trim()) {
            setClientError("Please enter an assessment title.");
            return;
        }

        if (!questionsGeneration.targetRole.trim()) {
            setClientError("Please enter a target role.");
            return;
        }

        if (!questionsGeneration.difficulty) {
            setClientError("Please select a difficulty level.");
            return;
        }

        try {
            const res = await dispatch(generateAiQuestions(questionsGeneration)).unwrap();
            if (res?.data && res.data.length > 0) {
                setAiQuestions(res.data);
            }
        } catch (err) {
            console.error("AI question generation error:", err);
        }
    }

    function handleEdit(index) {
        setEditingIndex(index);
        setEditedQuestion(aiQuestions[index].question);
    }

    function handleSaveEdit(index) {
        if (!editedQuestion.trim()) {
            return;
        }

        const newQuestions = aiQuestions.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    question: editedQuestion.trim()
                };
            }
            return item;
        });

        setAiQuestions(newQuestions);
        setEditingIndex(null);
        setEditedQuestion("");
    }

    function handleCancelEdit() {
        setEditingIndex(null);
        setEditedQuestion("");
    }

    function handleAddQuestion() {
        if (!newQuestion.trim()) {
            return;
        }

        if (clientError) setClientError("");
        setAiQuestions((prev) => [
            ...prev,
            { question: newQuestion.trim() }
        ]);

        setNewQuestion("");
    }

    function handleQuestionKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddQuestion();
        }
    }

    function handleDelete(index) {
        setAiQuestions((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleCreateAssessment(e) {
        e.preventDefault();
        setClientError("");
        dispatch(clearMentorAssessmentState());

        if (!questionsGeneration.studentId) {
            setClientError("Please select a mentee to assign the assessment.");
            return;
        }

        if (!questionsGeneration.title.trim()) {
            setClientError("Please enter an assessment title.");
            return;
        }

        if (!questionsGeneration.targetRole.trim()) {
            setClientError("Please enter a target role.");
            return;
        }

        if (!questionsGeneration.difficulty) {
            setClientError("Please select a difficulty level.");
            return;
        }

        if (!aiQuestions || aiQuestions.length === 0) {
            setClientError("No questions found. Please generate or add questions before finalizing.");
            return;
        }

        const payload = {
            studentId: questionsGeneration.studentId,
            title: questionsGeneration.title,
            difficulty: questionsGeneration.difficulty,
            targetRole: questionsGeneration.targetRole,
            questions: aiQuestions
        };

        try {
            await dispatch(createAiAssessment(payload)).unwrap();
            // Reset fields only on successful creation
            setQuestionsGeneration({
                studentId: "",
                title: "",
                difficulty: "",
                targetRole: "",
                noOfQuestions: ""
            });
            setAiQuestions([]);
            setNewQuestion("");
            setEditingIndex(null);
            setEditedQuestion("");
            setQuestionNumberError("");
        } catch (err) {
            console.error("Create AI assessment error:", err);
            // Form is preserved so the user doesn't lose anything
        }
    }

    const displayedError =
        clientError ||
        (serverError
            ? typeof serverError === "string"
                ? serverError
                : serverError.message || "Failed to process assessment."
            : "");

    if (loading && mentees.length === 0) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto text-left space-y-6 animate-pulse">
                <div className="w-44 h-8 bg-bg-muted rounded-xl"></div>
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 space-y-5">
                    <div className="w-full h-11 bg-bg-muted rounded-xl"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="w-full h-11 bg-bg-muted rounded-xl"></div>
                        <div className="w-full h-11 bg-bg-muted rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto text-left space-y-6 transition-colors duration-200">
            {/* Feedback Alerts */}
            {message && (
                <div className="p-4 rounded-xl bg-status-success-subtle border border-status-success/30 text-sm font-semibold text-status-success flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{message}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => dispatch(clearMentorAssessmentState())}
                        className="text-status-success hover:opacity-75 text-xs font-bold px-2 py-1 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {displayedError && (
                <div className="p-4 rounded-xl bg-status-danger-subtle border border-status-danger/30 text-sm font-semibold text-status-danger flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.332.192 3 1.732 3z" />
                        </svg>
                        <span>{displayedError}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setClientError("");
                            dispatch(clearMentorAssessmentState());
                        }}
                        className="text-status-danger hover:opacity-75 text-xs font-bold px-2 py-1 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Header & Back Button */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/mentor/assessment")}
                    className="mb-3 text-xs sm:text-sm font-medium text-text-muted hover:text-text-primary transition cursor-pointer flex items-center gap-1.5"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Assessments</span>
                </button>

                <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                        Generate Assessment with AI
                    </h1>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-subtle text-brand-primary border border-brand-primary/20">
                        Powered By AI
                    </span>
                </div>

                <p className="mt-1 text-sm text-text-secondary">
                    Provide the assessment topic, target role, and difficulty to generate tailored questions automatically.
                </p>
            </div>

            {/* AI Generation Form */}
            <form
                onSubmit={handleQuestionGeneration}
                className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-card space-y-5"
            >
                {/* Select Student */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                        Select Mentee <span className="text-status-danger">*</span>
                    </label>

                    <select
                        name="studentId"
                        value={questionsGeneration.studentId}
                        onChange={handleFormData}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                    >
                        <option value="">Select Mentee</option>
                        {mentees.map((user) => (
                            <option key={user.student?._id || user._id} value={user.student?._id || user._id}>
                                {user.student?.username || user.username || "Mentee"} ({user.student?.email || user.email})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title & Target Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Assessment Title <span className="text-status-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={questionsGeneration.title}
                            onChange={handleFormData}
                            placeholder="e.g. Backend Architecture & Node.js"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Target Role <span className="text-status-danger">*</span>
                        </label>
                        <input
                            type="text"
                            name="targetRole"
                            value={questionsGeneration.targetRole}
                            onChange={handleFormData}
                            placeholder="e.g. Node.js Backend Engineer"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                        />
                    </div>
                </div>

                {/* Difficulty & Number of Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Difficulty Level <span className="text-status-danger">*</span>
                        </label>
                        <select
                            name="difficulty"
                            value={questionsGeneration.difficulty}
                            onChange={handleFormData}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                        >
                            <option value="">Select Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Number of Questions <span className="text-status-danger">*</span>
                        </label>
                        <input
                            type="number"
                            name="noOfQuestions"
                            value={questionsGeneration.noOfQuestions}
                            onChange={handleFormData}
                            placeholder="Must be greater than 3"
                            min="4"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                        />
                        {questionNumberError && (
                            <p className="mt-1 text-xs text-status-danger font-medium">
                                {questionNumberError}
                            </p>
                        )}
                    </div>
                </div>

                {/* Generate Button */}
                <div className="border-t border-border-default pt-5">
                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                <span>Generating AI Questions...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Generate Questions with AI</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Generated Questions Section */}
            {aiQuestions.length > 0 && (
                <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
                    {/* Questions Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-border-default border-b">
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">
                                Generated Questions ({aiQuestions.length})
                            </h2>
                            <p className="text-xs text-text-muted">
                                Review, edit, remove, or append additional questions before assignment
                            </p>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-3">
                        {aiQuestions.map((item, index) => (
                            <div
                                key={index}
                                className="p-3.5 rounded-xl border border-border-default bg-bg-muted/40"
                            >
                                {editingIndex === index ? (
                                    <div className="space-y-2.5">
                                        <input
                                            type="text"
                                            value={editedQuestion}
                                            onChange={(e) => setEditedQuestion(e.target.value)}
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-border-strong bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-ring"
                                        />

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSaveEdit(index)}
                                                className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                                            >
                                                Save
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-3.5 py-1.5 bg-bg-muted text-text-secondary border border-border-default text-xs font-medium rounded-lg hover:bg-border-default transition cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="text-sm text-text-primary leading-relaxed flex-1">
                                            <span className="font-bold text-brand-primary mr-2">
                                                {index + 1}.
                                            </span>
                                            {item.question}
                                        </p>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(index)}
                                                className="text-xs font-semibold text-text-muted hover:text-text-primary px-2.5 py-1 rounded-lg hover:bg-bg-muted transition cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(index)}
                                                className="text-xs font-semibold text-status-danger hover:bg-status-danger-subtle px-2.5 py-1 rounded-lg transition cursor-pointer"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Custom Question */}
                    <div className="border-t border-border-default pt-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Add Another Question
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                                type="text"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                onKeyDown={handleQuestionKeyDown}
                                placeholder="Type a custom question and click Add Question"
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                            />

                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="px-5 py-2.5 bg-bg-muted hover:bg-border-default text-text-primary text-sm font-semibold rounded-xl border border-border-default transition cursor-pointer shrink-0"
                            >
                                Add Question
                            </button>
                        </div>
                    </div>

                    {/* Final Action Button */}
                    <div className="border-t border-border-default pt-5 flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={handleCreateAssessment}
                            disabled={isSubmitting || aiQuestions.length === 0}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                    <span>Finalizing & Assigning Assessment...</span>
                                </>
                            ) : (
                                <span>Finalize & Assign Assessment</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}