import { useSelector } from "react-redux"
export default function Weakness(){
    const {data,serverError,loading}=useSelector((state)=>{
        return state.dashboard
    })
    return (
        <>
        <h3 style={{color:"lightgoldenrodyellow"}}>Improvements</h3>

        {serverError && <p style={{color:"red"}}>{serverError.status} - {serverError.message}</p> }

        <ol style={{color:"lightgoldenrodyellow"}}>
            {data?.roleAnalysis?.weaknesses?.map((weekness,index)=>{
                return <li key={index}>{weekness}</li>
            })}
        </ol>
        </>
    )
}