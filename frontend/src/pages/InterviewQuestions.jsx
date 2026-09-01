import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInterviewQuestions, generateInterviewQuestions } from "../slices/InterviewQuestionsSlice";
import Questions from "../components/interviewQuestions/Questions";

export default function InterviewQuestions() {
    const dispatch = useDispatch();
    const { data, loading, generating, serverError } = useSelector((state) =>{
        return state.interviewQuestions 
    });

    const [difficulty, setDifficulty] = useState("beginner");

    useEffect(() => {
        dispatch(fetchInterviewQuestions());
    }, [dispatch]);

    function handleChange(e) {
        setDifficulty(e.target.value);
    }

    function handleGenerate() {
        dispatch( generateInterviewQuestions({ difficulty })
        );
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <h1>Interview Questions</h1>
            {serverError && ( <p style={{ color: "red" }}> {serverError.status} - {serverError.message} </p> )}

            <form >
                <select value={difficulty} onChange={handleChange} >
                    <option value="beginner"> Beginner </option>
                    <option value="intermediate"> Intermediate </option>
                    <option value="advanced"> Advanced </option>
                </select>
                {" "}
                <button type="button" onClick={handleGenerate} disabled={generating} > {generating ? "Generating..." : "Generate Questions" } </button>
            </form>
           
            {!data && ( <p>  No interview questions generated yet.</p> )}

            {data && (
                <>
                    <h2>{data.role}</h2>
                    <Questions />
                </>
            )}
        </>
    );
}