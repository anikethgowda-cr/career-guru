import { useSelector } from "react-redux";

export default function MissingSkills(){
    const {data,loading,serverError}=useSelector((state)=>{
        return state.dashboard
    })
    return (
        <>
        <h3 style={{color:"lightgoldenrodyellow"}}>Missing Skills</h3>

        {serverError && <p style={{color:"red"}}>{serverError.status} - {serverError.message}</p> }
        
        <ol style={{color:"lightgoldenrodyellow"}}>
            {data?.roleAnalysis?.missingSkills?.map((skill,index)=>{
                return <li key={index}>{skill}</li>
            })}
        </ol>
        
        </>
    )
}