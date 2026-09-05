import {useState} from "react"
import axios from "../../config/axios-config"
import {useNavigate,Link} from "react-router-dom"

export default function Register(){
    const navigate=useNavigate()
    const[formData,setFormData]= useState({username:"",email:"",password:"",phone:""})
    const[role,setRole]=useState("user")
    const[serverError,setServerError]=useState("")

    function handleFormData(e){
        const key=e.target.name
        const value=e.target.value
        setFormData({...formData,[key]:value})
    }

    async function handleSubmit(e) {
    e.preventDefault();

    const endpoint = role === "user" ? "/user/register": "/mentor/register";
    try {
        const response = await axios.post(endpoint, formData);
        console.log(response.data);
        setFormData({
            username: "",
            email: "",
            password: "",
            phone: ""
        });
        setTimeout(()=>{
            navigate('/login')
        },2000)
        
        setServerError("");

    } catch (err) {
        const message =err.response?.data?.message ||"Something went wrong";
        console.log(message);
        setServerError(message);
    }
}
    
    
    return(
        <>
        
        <form onSubmit={handleSubmit}>

            <button type="button" onClick={()=>{setRole("user")}}>user</button> {" "} <button  type="button" onClick={()=>{setRole("mentor")}}>mentor</button> <br />
            <h2> Register as {role === "user" ? "User" : "Mentor"} </h2>
            {serverError && <p style={{color:"red"}}>{serverError}</p>  }
            <label >username:</label>
            <input type="text" required placeholder="Username" name="username" value={formData.username} onChange={handleFormData}/><br />
            <label >email:</label>
            <input type="email" required placeholder="Email"  name="email" value={formData.email}  onChange={handleFormData}/><br />
            <label >password:</label>
            <input type="text" required placeholder="password" name="password" value={formData.password}  onChange={handleFormData}/><br />
            <label >Phone Number</label>
            <input type="text" required placeholder="phone" name="phone" value={formData.phone}  onChange={handleFormData}/> <br />
            <p><Link to="/login">Sign in</Link></p>
            <button type="submit" >Register</button>
  
        </form>
        </>
    )
}