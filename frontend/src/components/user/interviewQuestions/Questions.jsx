import { useSelector } from "react-redux"
import {useState} from "react"

export default function Questions(){
    const[ showAnswer,setShowAnswer ]=useState(null)

    const {data}=useSelector((state)=>{
        return state.interviewQuestions
    })

    function handleShowAnswer(id){
        
        if(showAnswer==id){
            setShowAnswer(null )
        } else{
            setShowAnswer(id)
        }
    }

    return (
        <>
        {data &&(
            <ol>
                {data.questions.map((ele)=>{
                    return (
                    <li key={ele._id}>
                        <h3>{ele.question}</h3> 
                        <button onClick={()=>{handleShowAnswer(ele._id)}}> {showAnswer === ele._id ? "Hide Answer" : "View Answer" }</button>  {"  "} <i>{ele.difficulty}</i>
                        {showAnswer==ele._id &&
                        (<ul style={{color:"green"}}>{ele.answer.map((item,index)=>{
                            return (
                                <li key={index}>{item}</li>
                            )
                        })}</ul>)}
                    </li>
                    )
                })}
            </ol>   
        )}
        </>
    )
}