import { useSelector } from "react-redux";

export default function Skills(){
    const {data,serverError,loading}=useSelector((state)=>{
        return state.dashboard
    })
    return (
        <>
        <h3 style={{color:"lightgreen"}}>Skills</h3>

        {serverError && <p style ={{color:"red"}}>{serverError.status} - {serverError.message}</p> }
        
        <ol style={{color:"lightgreen"}}>
            {data?.roleAnalysis?.valueAddingSkills?.map((skill,index)=>{
                return <li key={index}>{skill}</li>
            })}
        </ol>
        
        </>
    )
}