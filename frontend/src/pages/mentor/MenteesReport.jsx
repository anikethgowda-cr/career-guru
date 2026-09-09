import { useEffect } from "react"
import {useNavigate, useParams } from "react-router-dom"
import { useSelector,useDispatch } from "react-redux"

import { fetchReport,clearReportServerError } from "../../slices/mentor/MenteesSlice"

export default function MenteesReport(){
    const navigate =useNavigate()
    const dispatch= useDispatch()
    const {studentId} =useParams()

    const {report,reportLoading,serverError}= useSelector((state)=>{
        return state.mentees
    })

    useEffect(() => {
        if (studentId) {
            dispatch(fetchReport(studentId))
        }
        return ()=>{
            dispatch(clearReportServerError())
        }
    }, [studentId, dispatch])

    if (reportLoading){
        return <p>loading .....</p>
    }
    
    function handleBack(){
        navigate("/mentor/mentees")
    }

    return(
        <>
        
        <button onClick={handleBack}>Back</button>
        {serverError ? 
        <p style={{color:"red"}}>{serverError.status} - {serverError.message}</p>:
        report &&  <div>
                <h1>Report</h1>
                <h2>CareerGoal</h2>
                <p>{report.careerGoals}</p>
                <h2>Mentor Guidance</h2>
                <p>{report.mentorGuidance}</p>
                <h2>MissingSkills</h2>
                <p>{report.missingSkills}</p>
                <h2>Strengths</h2>
                <p>{report.strengths}</p>
                <h2>Weekness</h2>
                <p>{report.weaknesses}</p>
                <h2>Value Addition</h2>
                <p>{report.valueAddingSkills}</p>
                <h2>Career Goal</h2>
                <p>{report.careerSummary}</p>
                
            </div>}
        </>
    )
}