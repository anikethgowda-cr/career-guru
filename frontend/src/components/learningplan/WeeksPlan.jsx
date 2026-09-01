import { Fragment } from "react";
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";

export default function WeeksPlan(){
    const navigate =useNavigate()

    const {data}=useSelector((state)=>{
        return state.learningPlan
    })

    console.log(data.weeks[0].sessions)
    
    function handleNavigation(weekNumber){
        navigate(`/user/learning-plan/week/${weekNumber}`)
    }
    return (
        <>
        <h1>Weeks Plan</h1>
        <div>
            {data.weeks.map((week)=>{
                return (
                <Fragment key={week.weekNumber} >
                    <h3>Week-{week.weekNumber}</h3>
                    <h4>Objective -{week.overview}</h4>
                    <button onClick={()=>handleNavigation(week.weekNumber)}>view</button>
                </Fragment >
                )
            })}
        </div>
        
        
        </>
    )
}