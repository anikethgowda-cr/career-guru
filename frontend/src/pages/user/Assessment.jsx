import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAssessments ,createAssessmentAttempt } from "../../slices/user/UserAssessmentSlice";
import { useNavigate } from "react-router-dom";

export default function Assessment() {
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const { assessments, loading, serverError } = useSelector((state) => {
        return state.userAssessment;
    });

    useEffect(() => {
        dispatch(fetchAssessments());
    }, [dispatch]);

    async function handleTakeAssessment(assessmentId) {
    try {
        await dispatch(createAssessmentAttempt(assessmentId)).unwrap();
        navigate(`/user/assessment/${assessmentId}/interview`);
    } catch (err) {
        console.log(err);
    }
}

    if (loading) {
        return <p>Loading....</p>;
    }

    if (serverError) {
        return <p>{serverError}</p>;
    }

    const pendingAssessments = assessments?.filter((assessment) => {
        return assessment.status === "pending";
    });

    const completedAssessments = assessments?.filter((assessment) => {
        return assessment.status === "completed";
    });

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-6">
                My Assessments
            </h3>

            {/* Pending Assessments */}
            {pendingAssessments?.length > 0 && (
                <>
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-zinc-300 mb-4">
                        Pending
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {pendingAssessments.map((assessment) => (
                            <div
                                key={assessment._id}
                                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                            {assessment.title}
                                        </h2>

                                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                            {assessment.targetRole}
                                        </p>
                                    </div>

                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 capitalize">
                                        {assessment.difficulty}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-zinc-400">
                                            Mentor
                                        </span>

                                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                                            {assessment.mentorId?.username}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-zinc-400">
                                            Questions
                                        </span>

                                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                                            {assessment.questions?.length}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleTakeAssessment(assessment._id)}
                                    className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded-xl transition cursor-pointer"
                                >
                                    Take Assessment
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Completed Assessments */}
            {completedAssessments?.length > 0 && (
                <>
                    <h4 className="text-lg font-semibold text-slate-700 dark:text-zinc-300 mb-4">
                        Completed
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {completedAssessments.map((assessment) => (
                            <div
                                key={assessment._id}
                                className="bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-900 rounded-2xl p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                                            {assessment.title}
                                        </h2>

                                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                                            {assessment.targetRole}
                                        </p>
                                    </div>

                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 capitalize">
                                        {assessment.difficulty}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-zinc-400">
                                            Mentor
                                        </span>

                                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                                            {assessment.mentorId?.username}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-zinc-400">
                                            Questions
                                        </span>

                                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                                            {assessment.questions?.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full px-4 py-2.5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium rounded-xl text-center">
                                    ✓ Completed
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* No assessments at all */}
            {(!pendingAssessments?.length && !completedAssessments?.length) && (
                <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center">
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        No Assessment Found
                    </p>
                </div>
            )}
        </div>
    );
}