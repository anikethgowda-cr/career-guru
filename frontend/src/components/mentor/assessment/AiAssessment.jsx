import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMentees, generateAiQuestions, createAiAssessment } from "../../../slices/mentor/MentorAssessmentSlice";

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

    const [assessmentData, setAssessmentData] = useState({
        studentId: "",
        title: "",
        difficulty: "",
        targetRole: "",
        questions: []
    });

    const [questionNumberError, setQuestionNumberError] = useState("");
    const [aiQuestions, setAiQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedQuestion, setEditedQuestion] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [serverMessage,setServerMessage]=useState("");

    const { mentees,message,serverError,loading } = useSelector((state) => {
        return state.mentorAssessment;
    });

    useEffect(() => {
        dispatch(fetchMentees());
    }, [dispatch]);

    useEffect(() => {
        setAssessmentData({
            studentId: questionsGeneration.studentId,
            title: questionsGeneration.title,
            difficulty: questionsGeneration.difficulty,
            targetRole: questionsGeneration.targetRole,
            questions: aiQuestions
        });
    }, [questionsGeneration, aiQuestions]);

    useEffect(() => {
            if (message) {
                setServerMessage(message);
    
                const timer = setTimeout(() => {
                    setServerMessage("");
                }, 2000);
    
                return () => clearTimeout(timer);
            }
        }, [message]);

    function handleFormData(e) {
        setQuestionsGeneration((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    async function handleQuestionGeneration(e) {
        try {
            e.preventDefault();
            setQuestionNumberError("");

            if (Number(questionsGeneration.noOfQuestions) <= 3) {
                setQuestionNumberError(
                    "Number of questions should be greater than 3"
                );
                return;
            }

            setIsGenerating(true);

            const response = await dispatch(
                generateAiQuestions(questionsGeneration)
            ).unwrap();

            setAiQuestions(response.data);
        } catch (err) {
            console.log(err);
        } finally {
            setIsGenerating(false);
        }
    }

    function handleDelete(index) {
        const newQuestions = aiQuestions.filter((_, i) => i !== index);
        setAiQuestions(newQuestions);
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

        setAiQuestions((prev) => [
            ...prev,
            {
                question: newQuestion.trim()
            }
        ]);

        setNewQuestion("");
    }

    function handleQuestionKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddQuestion();
        }
    }

    function handleCreateAssessment(e) {
        e.preventDefault();
        dispatch(createAiAssessment(assessmentData));
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
    }

    if(loading){
        return <p>loading....</p>
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto text-left space-y-6">
            {serverMessage && <p style={{color:"green"}}>{serverMessage}</p>}
            {serverError && <p style={{color:"red"}}>{serverError.status} - {serverError.message}</p>}
            {/* Header & Back Button */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/mentor/assessment")}
                    className="mb-3 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition cursor-pointer flex items-center gap-1.5"
                >
                    &larr; Back to Assessments
                </button>

                <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100">
                        Create Assessment through AI
                    </h1>

                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Powered By AI
                    </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                    Provide the assessment topic, target role, and difficulty to generate tailored questions automatically.
                </p>
            </div>

            {/* AI Generation Form */}
            <form
                onSubmit={handleQuestionGeneration}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
            >

                {/* Select Student */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                        Select Mentee
                    </label>

                    <select
                        name="studentId"
                        value={questionsGeneration.studentId}
                        onChange={handleFormData}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        <option value="">Select Mentee</option>

                        {mentees.map((user) => (
                            <option
                                key={user.student._id}
                                value={user.student._id}
                            >
                                {user.student.username}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Title & Target Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Title
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={questionsGeneration.title}
                            onChange={handleFormData}
                            placeholder="e.g. Backend API Design"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Target Role
                        </label>

                        <input
                            type="text"
                            name="targetRole"
                            value={questionsGeneration.targetRole}
                            onChange={handleFormData}
                            placeholder="e.g. Node.js Developer"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                    </div>

                </div>

                {/* Difficulty & Number of Questions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Difficulty
                        </label>

                        <select
                            name="difficulty"
                            value={questionsGeneration.difficulty}
                            onChange={handleFormData}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                            <option value="">Select Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Number of Questions
                        </label>

                        <input
                            type="number"
                            name="noOfQuestions"
                            value={questionsGeneration.noOfQuestions}
                            onChange={handleFormData}
                            placeholder="Must be greater than 3"
                            min="4"
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />

                        {questionNumberError && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                                {questionNumberError}
                            </p>
                        )}
                    </div>

                </div>

                {/* Generate Button */}
                <div className="border-t border-slate-200 dark:border-zinc-800 pt-5">
                    <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition cursor-pointer"
                    >
                        {isGenerating
                            ? "Generating Questions..."
                            : "Generate Questions"}
                    </button>
                </div>

            </form>

            {/* Generated Questions Section */}
            {aiQuestions.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

                    {/* Questions Header */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                            Generated Questions ({aiQuestions.length})
                        </h2>

                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            You can edit, remove, or add new questions below
                        </span>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-3">

                        {aiQuestions.map((item, index) => (
                            <div
                                key={index}
                                className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/50"
                            >

                                {editingIndex === index ? (
                                    <div className="space-y-2.5">

                                        <input
                                            type="text"
                                            value={editedQuestion}
                                            onChange={(e) =>
                                                setEditedQuestion(e.target.value)
                                            }
                                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        />

                                        <div className="flex items-center gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSaveEdit(index)
                                                }
                                                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium rounded-lg transition cursor-pointer"
                                            >
                                                Save
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-lg transition cursor-pointer"
                                            >
                                                Cancel
                                            </button>

                                        </div>

                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-3">

                                        <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed">
                                            <span className="font-semibold text-slate-500 mr-2">
                                                {index + 1}.
                                            </span>

                                            {item.question}
                                        </p>

                                        <div className="flex items-center gap-1 shrink-0">

                                            <button
                                                type="button"
                                                onClick={() => handleEdit(index)}
                                                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-700/60 transition cursor-pointer"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(index)}
                                                className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>

                    {/* Add Question */}
                    <div className="border-t border-slate-200 dark:border-zinc-800 pt-5">

                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Add Question
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2.5">

                            <input
                                type="text"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                onKeyDown={handleQuestionKeyDown}
                                placeholder="Enter a new question"
                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />

                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-sm font-medium rounded-xl transition cursor-pointer shrink-0"
                            >
                                Add Question
                            </button>

                        </div>

                    </div>

                    {/* Final Action Button */}
                    <div className="border-t border-slate-200 dark:border-zinc-800 pt-5">

                        <button
                            type="button"
                            onClick={handleCreateAssessment}
                            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition cursor-pointer"
                        >
                            Create Assessment
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}