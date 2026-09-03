import { useEffect } from "react"
import {useSelector,useDispatch} from "react-redux"
import { fetchProfileDetails } from "../slices/ProfileSlice"
import ProfileDetails from "../components/profile/ProfileDetails"

export default function Profile(){
    const dispatch=useDispatch()

    const {data,loading} =useSelector((state)=>{
        return state.profile
    })


    useEffect(()=>{
        dispatch(fetchProfileDetails())
    },[dispatch])

    if(loading){
        return <p>Loading.....</p>
    }
    return (
        <>
        {data && <ProfileDetails data={data}/>} 
        </>
    )
}