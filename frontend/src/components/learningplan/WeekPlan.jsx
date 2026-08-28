import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { fetchLearningPlan } from "../../slices/LearningPlanSlice";
import Topics from "./Topics";
import Skills from "./Skills";
import Materials from "./Materials";

export default function WeekPlan() {
    const dispatch =useDispatch()
    const { weekNumber } = useParams();

    const { data, loading, serverError } = useSelector(
        (state) => state.learningPlan
    );

    useEffect(() => {
        if (!data) {
            dispatch(fetchLearningPlan());
        }
    }, [data, dispatch]);

    const week = data?.weeks?.find(
        (week) => week.weekNumber === Number(weekNumber)
    );

    console.log(week?.sessions)


    return (
        <>  
            {loading && <h2>Loading...</h2>}

            {serverError && (<p style={{color:"red"}}>{serverError.message}</p>)}

            {!loading && !serverError && week && (
                <>
                    <h1>Week {week.weekNumber}</h1>
                    <h2>{week.overview}</h2>
                
                    <table border={1}>
                        <thead>
                            <tr>
                                <th>title</th>
                                <th>topics</th>
                                <th>skills</th>
                                <th>reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {week.sessions.map((session,index)=>{
                                return (
                                    <tr key={index}>
                                        <td>{session.title}</td>
                                        <td><Topics topics={session.topics}/></td>
                                        <td><Skills skills={session.skills}/></td>
                                        <td><Materials materials={session.materials}/></td>
                                    </tr>    
                                )
                            })}
                        </tbody>
                    </table>
                </>
            )} 
            {!loading && !serverError && data && !week && (<h2>Week not found</h2>)}
        </>
    );
}