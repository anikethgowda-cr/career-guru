import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchMentees,
    createAssessmentManually,
    clearMentorAssessmentState
} from "../../../slices/mentor/MentorAssessmentSlice";

export default function ManualAssessment() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [manualAssessment, setManualAssessment] = useState({
        studentId: "",
        title: "",
        difficulty: "",
        questions: [],
        targetRole: ""
    });

    const [question, setQuestion] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editedQuestion, setEditedQuestion] = useState("");
    const [clientError, setClientError] = useState("");

    const { mentees, message, serverError, loading, isSubmitting } = useSelector(
        (state) => state.mentorAssessment
    );

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

    function handleChange(e) {
        if (clientError) setClientError("");
        if (serverError) dispatch(clearMentorAssessmentState());
        setManualAssessment((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    function handleAddQuestion() {
        if (!question.trim()) {
            return;
        }

        if (clientError) setClientError("");
        setManualAssessment((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                { question: question.trim() }
            ]
        }));

        setQuestion("");
    }

    function handleQuestionKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddQuestion();
        }
    }

    function handleEdit(index) {
        setEditIndex(index);
        setEditedQuestion(manualAssessment.questions[index].question);
    }

    function handleCancelEdit() {
        setEditIndex(null);
        setEditedQuestion("");
    }

    function handleSaveEdit(index) {
        if (!editedQuestion.trim()) {
            return;
        }

        const newQuestions = manualAssessment.questions.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    question: editedQuestion.trim()
                };
            }
            return item;
        });

        setManualAssessment((prev) => ({
            ...prev,
            questions: newQuestions
        }));

        setEditIndex(null);
        setEditedQuestion("");
    }

    function handleDelete(index) {
        setManualAssessment((prev) => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setClientError("");
        dispatch(clearMentorAssessmentState());

        if (!manualAssessment.studentId) {
            setClientError("Please select a mentee to assign the assessment.");
            return;
        }
        if (!manualAssessment.title.trim()) {
            setClientError("Please enter an assessment title.");
            return;
        }
        if (!manualAssessment.targetRole.trim()) {
            setClientError("Please enter a target role.");
            return;
        }
        if (!manualAssessment.difficulty) {
            setClientError("Please select a difficulty level.");
            return;
        }
        if (!manualAssessment.questions || manualAssessment.questions.length === 0) {
            setClientError("Please add at least one question before assigning.");
            return;
        }

        try {
            await dispatch(createAssessmentManually(manualAssessment)).unwrap();
            // Reset form inputs only on successful creation
            setManualAssessment({
                studentId: "",
                title: "",
                difficulty: "",
                questions: [],
                targetRole: ""
            });
            setQuestion("");
            setEditIndex(null);
            setEditedQuestion("");
        } catch (err) {
            console.error("Manual assessment creation error:", err);
            // Form is intentionally preserved so user does not lose their typed questions!
        }
    }

    const displayedError =
        clientError ||
        (serverError
            ? typeof serverError === "string"
                ? serverError
                : serverError.message || "Failed to create assessment."
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
            {/* Success Feedback Alert */}
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

            {/* Error Feedback Alert */}
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

            {/* Header */}
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

                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    Manually Create Assessment
                </h1>

                <p className="mt-1 text-sm text-text-secondary">
                    Configure details and compose tailored questions to assign to your mentees.
                </p>
            </div>

            {mentees.length > 0 ? (
                <form
                    onSubmit={handleSubmit}
                    className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-card space-y-5"
                >
                    {/* Mentee Select */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Select Mentee <span className="text-status-danger">*</span>
                        </label>

                        <select
                            name="studentId"
                            value={manualAssessment.studentId}
                            onChange={handleChange}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                                Assessment Title <span className="text-status-danger">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={manualAssessment.title}
                                onChange={handleChange}
                                placeholder="e.g. React & TypeScript Fundamentals"
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
                                value={manualAssessment.targetRole}
                                onChange={handleChange}
                                placeholder="e.g. Frontend Engineer"
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Difficulty Level <span className="text-status-danger">*</span>
                        </label>
                        <select
                            name="difficulty"
                            value={manualAssessment.difficulty}
                            onChange={handleChange}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-border-default bg-bg-muted/50 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-ring focus:border-brand-primary transition"
                        >
                            <option value="">Select Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    {/* Add Question Input */}
                    <div className="border-t border-border-default pt-5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                            Add Question <span className="text-status-danger">*</span>
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <input
                                type="text"
                                name="question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleQuestionKeyDown}
                                placeholder="Type an interview question and press Enter or click Add Question"
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

                    {/* Question List */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-text-primary">
                                Questions List
                            </h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-subtle text-brand-primary">
                                {manualAssessment.questions.length} Question{manualAssessment.questions.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {manualAssessment.questions.length > 0 ? (
                            <div className="space-y-2.5">
                                {manualAssessment.questions.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-border-default bg-bg-muted/40"
                                    >
                                        {editIndex === index ? (
                                            <div className="flex flex-col sm:flex-row gap-2 w-full">
                                                <input
                                                    type="text"
                                                    value={editedQuestion}
                                                    onChange={(e) => setEditedQuestion(e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-lg border border-border-strong bg-bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-ring"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveEdit(index)}
                                                    className="px-3.5 py-2 text-xs font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition cursor-pointer"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="px-3.5 py-2 text-xs font-semibold text-text-secondary bg-bg-muted border border-border-default rounded-lg hover:bg-border-default transition cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-text-muted italic p-4 rounded-xl border border-dashed border-border-default text-center">
                                No questions added yet. Type a question above and click Add Question to get started.
                            </p>
                        )}
                    </div>

                    <div className="border-t border-border-default pt-5 flex items-center justify-between gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || manualAssessment.questions.length === 0}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                    <span>Assigning Assessment...</span>
                                </>
                            ) : (
                                <span>Assign Assessment</span>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-10 rounded-2xl bg-bg-surface border border-border-default text-center space-y-2">
                    <p className="text-base font-semibold text-text-primary">
                        No Mentees Found
                    </p>
                    <p className="text-xs sm:text-sm text-text-muted max-w-sm mx-auto">
                        You do not currently have any active mentees to assign assessments to.
                    </p>
                </div>
            )}
        </div>
    );
}