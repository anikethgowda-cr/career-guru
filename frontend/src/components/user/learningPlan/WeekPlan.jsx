import { Fragment, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { fetchLearningPlan } from "../../../slices/user/LearningPlanSlice"


export default function WeekPlan() {
    const dispatch =useDispatch()
    const { weekNumber } = useParams();

    const { data, loading, serverError } = useSelector(
        (state) => state.learningPlan
    )

    useEffect(() => {
        if (!data) {
            dispatch(fetchLearningPlan());
        }
    }, [data, dispatch])

    const week = data?.weeks?.find((week) => week.weekNumber === Number(weekNumber))

    console.log(week?.sessions)


    return (
        <>  
            {loading && <h2>Loading...</h2>}

            {serverError && (<p style={{color:"red"}}>{serverError.status} - {serverError.message}</p>)}

            {!loading && !serverError && week && (
                <>
                    <small>Week {week.weekNumber} - {week.overview}</small>
                    <table border={1}>
                        {week?.sessions.map((plan,index)=>{
                            return(
                                <Fragment key={index}>
                                    <thead>
                                        <tr>
                                            <th>Title:{plan.title} {"  "} <i>Skills{" "}:</i>{plan.skills.join(", ")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Topics:{plan.topics.join(", ")}</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <ol>{plan.materials.map((material,index)=>{
                                                    return (
                                                        <li key ={index}><a href={material.url} target="_blank">{material.name}</a>{" "}<small> {material.type}</small></li>
                                                    )
                                                })} </ol>
                                            </td>
                                        </tr>
                                    </tbody>
                                </Fragment>
                            )
                        })}
                    </table>
                </>
            )} 

            {!loading && !serverError && data && !week && (<h2>Week not found</h2>)}
        </>
    );
}