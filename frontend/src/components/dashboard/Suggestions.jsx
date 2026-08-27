import { useSelector } from "react-redux";

export default function Suggestion(){
    const {data,serverError,loading}=useSelector((state)=>{
        return state.dashboard
    })
    return (
        <>
        <h3 style={{color:"lightskyblue"}}>Suggestions</h3>

        {serverError &&  <p style={{color:"red"}}>{serverError.status} - {serverError.message}</p> }
        
        <ol style={{color:"lightskyblue"}}>
            {data?.roleAnalysis?.suggestions?.map((suggestion,index)=>{
                return <li key={index}>{suggestion}</li>
            })}
        </ol>
        </>
    )
}