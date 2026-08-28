import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchLearningPlan,
    generateLearningPlan
} from "../slices/LearningPlanSlice";
import WeeksPlan from "../components/learningplan/WeeksPlan";

export default function LearningPlan() {
    const dispatch = useDispatch();

    const { data, targetRole, missingSkills, loading, generating, serverError } = useSelector((state) => {
        return state.learningPlan;
    });

    useEffect(() => {
        dispatch(fetchLearningPlan());
    }, [dispatch]);

    return (
        <>
            {loading && <h2>Loading your learning plan...</h2>}

            {serverError && !loading && (<h2 style={{ color: "red" }}>{serverError?.status} - {serverError.message}</h2>)}
            
            {!loading && !serverError && !data && (
                <div>
                    <h1>Build Your Learning Plan</h1>
                    <p>Your target role is:</p>
                    <h2>{targetRole}</h2>
                    <p>
                        Based on your resume analysis,
                        we identified some skills that
                        you can improve to become more
                        job-ready.
                    </p>
                    <h3>Skills you should improve</h3>
                    <div>
                        {missingSkills?.map((skill, index) => (
                            <span key={index}>
                                {skill}{" "}
                            </span>
                        ))}
                    </div>
                    <p>
                        We can create a personalized
                        6-week learning plan based on
                        your target role and skill gaps.
                    </p>

                    <button onClick={() => dispatch(generateLearningPlan())} disabled={generating}>
                        {generating ? "Generating..." : "Generate Learning Plan"}
                    </button>
                </div>
            )}

            {data && <WeeksPlan />}
        </>
    );
}