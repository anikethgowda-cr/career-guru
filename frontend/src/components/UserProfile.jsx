import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "../config/axios-config";
import { useNavigate } from "react-router-dom";

export default function UserProfile(){

    const { user, loading } = useSelector(
            (state) => state.auth
        );
    const navigate = useNavigate();

    const [formData,setFormData] = useState({  education:"",  experience:"",preferredJobRole:"", preferredLocation:"", linkedin:"" });

    const [resume,setResume] = useState(null);
    const [resumeUploaded,setResumeUploaded] = useState(false);
    const [error,setError] = useState("");
    const [message,setMessage] = useState("");
    const [isUploading,setIsUploading] = useState(false);
    const [isSubmitting,setIsSubmitting] = useState(false);

    if(loading){
        return <p>Loading...</p>;
    }

    function handleFormData(e){
        const name = e.target.name;
        const value = e.target.value;
        setFormData({...formData, [name]:value});
    }

    function handleResume(e){
        const file = e.target.files[0];
        if(file){
            setResume(file);
            setResumeUploaded(false);
            setMessage("");
            setError("");
        }
    }

    async function handleUpload(){
        setError("");
        setMessage("");

        if(!resume){
            setError("Please select a resume");
            return;
        }

        try{
            setIsUploading(true);
            const resumeData = new FormData();
            resumeData.append( "resume", resume );
            const response = await axios.post( "/resume/upload", resumeData );

            console.log( "Resume Upload:", response.data );

            if(!response.data.success){
                setError("Resume upload failed");
                return;
            }

            setResumeUploaded(true);
            setMessage("Resume uploaded successfully");

        }catch(err){
            console.log( err.response?.data?.message ||"Something went wrong");
            setError( err.response?.data?.message || "Something went wrong" );
        }finally{
            setIsUploading(false);
        }
    }

    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        setMessage("");

        if(!formData.education.trim()){
            setError("Education is required");
            return;
        }

        if(!formData.experience.trim()){
            setError("Experience is required");
            return;
        }

        if(!formData.preferredJobRole.trim()){
            setError("Preferred job role is required");
            return;
        }

        if(!formData.preferredLocation.trim()){
            setError("Preferred location is required");
            return;
        }

        if(!resumeUploaded){
            setError("Please upload your resume first");
            return;
        }

        try{
            setIsSubmitting(true);
            const analysisResponse = await axios.post( "/resume/analyze",{ preferredJobRole:formData.preferredJobRole } );

            console.log( "Resume Analysis:", analysisResponse.data);

            if(!analysisResponse.data.success){
                setError("Resume analysis failed");
                return;
            }
            const profileResponse = await axios.post( "/user/profile", formData );
            console.log("Profile:",profileResponse.data);

            if(!profileResponse.data.success){
                setError("Profile creation failed");
                return;
            }
            navigate("/user/dashboard");
        }catch(err){
            console.log( err.response?.data?.message || "Something went wrong" );
            setError( err.response?.data?.message || "Something went wrong" );

        }finally{
            setIsSubmitting(false);
        }
    }

    return(
        <>
        <h1>Profile Form</h1>
        {error && ( <p style={{color:"red"}}> {error}</p>)}
        {message && ( <p style={{color:"green"}}> {message} </p>)}

        <form onSubmit={handleSubmit}>

            <label>Username:</label>{" "}
                <input  type="text"  value={user?.username || ""}  readOnly/>
                <br />
            <label>Education:</label>
                <input type="text" name="education" value={formData.education} onChange={handleFormData}/>
                <br />
            <label>Experience:</label>
                <input type="text" name="experience" value={formData.experience} onChange={handleFormData}/>
                <br />
            <label>Preferred Job Role:</label>
                <input type="text" name="preferredJobRole"  value={formData.preferredJobRole} onChange={handleFormData} />
                <br />
            <label>Preferred Location:</label>
                <input type="text" name="preferredLocation" value={formData.preferredLocation} onChange={handleFormData} />
                <br />
            <label>LinkedIn:</label>
                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleFormData} />
                <br />
            <label>Resume:</label>
                <input type="file" accept=".pdf"  onChange={handleResume} />
                <br />
                
            {!resumeUploaded && (
                <button type="button" onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload File"}
                </button>
            )}

            {resumeUploaded && (
                <button  type="submit" disabled={isSubmitting}  >
                    {isSubmitting ? "Analyzing..." : "Create Profile"  }
                </button>
            )}
        </form>
        </>
    );
}

