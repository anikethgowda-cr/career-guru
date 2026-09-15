import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMentees, createAssessmentManually } from "../../../slices/mentor/MentorAssessmentSlice";

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
    const [serverMessage,setServerMessage]=useState("")

    const { mentees ,message,serverError,loading} = useSelector((state) => {
        return state.mentorAssessment;
    });


    useEffect(() => {
        dispatch(fetchMentees());
    }, [dispatch]);


    useEffect(() => {
        if (message) {
            setServerMessage(message);

            const timer = setTimeout(() => {
                setServerMessage("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [message]);

    function handleChange(e) {
        setManualAssessment((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    function handleAddQuestion() {
        if (!question.trim()) {
            return;
        }

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
                    question: editedQuestion
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

    function handleSubmit(e) {
        e.preventDefault();
        dispatch(createAssessmentManually(manualAssessment));
        setManualAssessment({
            studentId: "",
            title: "",
            difficulty: "",
            questions: [],
            targetRole: ""
        });

        setQuestion("");
    }

    if(loading){
        return <p>loading....</p>
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto text-left space-y-6">
            {serverMessage && <p style={{color:"green"}}>{serverMessage}</p>}
            {serverError && <p style={{color:"red"}}>{serverError.status} - {serverError.message}</p>}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/mentor/assessment")}
                    className="mb-3 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition cursor-pointer flex items-center gap-1.5"
                >
                    &larr; Back to Assessments
                </button>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100">
                    Manually Create Assessment
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                    Configure details and write questions to assign to your mentees.
                </p>
            </div>

            {mentees.length > 0 ? (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
                >

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Select Mentee
                        </label>

                        <select
                            name="studentId"
                            value={manualAssessment.studentId}
                            onChange={handleChange}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                            <option value="">Select Mentee</option>

                            {mentees.map((user) => (
                                <option
                                    key={user.student._id}
                                    value={user.student._id}
                                >
                                    {user.student?.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                                Title
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={manualAssessment.title}
                                onChange={handleChange}
                                placeholder="e.g. React Fundamentals"
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
                                value={manualAssessment.targetRole}
                                onChange={handleChange}
                                placeholder="e.g. Frontend Developer"
                                required
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                            />
                        </div>

                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Difficulty
                        </label>

                        <select
                            name="difficulty"
                            value={manualAssessment.difficulty}
                            onChange={handleChange}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                            <option value="">Select Difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="border-t border-slate-200 dark:border-zinc-800 pt-5">

                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 mb-1.5">
                            Add Question
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2.5">

                            <input
                                type="text"
                                name="question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleQuestionKeyDown}
                                placeholder="Type a question and press Enter or click Add"
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

                    <div className="space-y-3 pt-2">

                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            Questions ({manualAssessment.questions.length})
                        </h3>

                        {manualAssessment.questions.length > 0 ? (
                            <div className="space-y-2">

                                {manualAssessment.questions.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/50"
                                    >

                                        {editIndex === index ? (
                                            <div className="flex flex-col sm:flex-row gap-2 w-full">

                                                <input
                                                    type="text"
                                                    value={editedQuestion}
                                                    onChange={(e) => setEditedQuestion(e.target.value)}
                                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveEdit(index)}
                                                    className="px-3 py-2 text-xs font-semibold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg cursor-pointer"
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                                                >
                                                    Cancel
                                                </button>

                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed flex-1">
                                                    <span className="font-semibold text-slate-500 mr-2">
                                                        {index + 1}.
                                                    </span>

                                                    {item.question}
                                                </p>

                                                <div className="flex gap-1 shrink-0">

                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(index)}
                                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2 py-1 rounded transition cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(index)}
                                                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded transition cursor-pointer"
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
                            <p className="text-xs text-slate-500 dark:text-zinc-400 italic">
                                No questions added yet. Type a question above to get started.
                            </p>
                        )}

                    </div>

                    <div className="border-t border-slate-200 dark:border-zinc-800 pt-5">

                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded-xl transition cursor-pointer"
                        >
                            Assign Assessment
                        </button>

                    </div>

                </form>
            ) : (
                <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        No mentees found to assign assessments.
                    </p>
                </div>
            )}

        </div>
    );
}