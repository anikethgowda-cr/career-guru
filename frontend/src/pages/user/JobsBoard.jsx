import {useSelector,useDispatch} from "react-redux"
import {useEffect} from "react"
import { fetchJobs } from "../../slices/JobsSlice"
import JobCard from "../../components/user/jobsBoard/JobCard"

export default function JobsBoard(){
    const dispatch = useDispatch()

    const {loading,serverError,data}=useSelector((state)=>{
        return state.jobs
    })

    useEffect(()=>{
        dispatch(fetchJobs())
    },[dispatch])

    if(loading){
        return <p>loading .....</p>
    }

    return (
        <>
        <h1>Jobs Board</h1>
        {serverError && ( <p style={{color:"red"}}>{serverError.status} - {serverError.message}</p> )}
        {data && <JobCard /> }
        </>
    )
}