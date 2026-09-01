import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate ,Link} from "react-router-dom";
export default function Login() {
    const navigate=useNavigate()
    const { handleLogin } = useContext(AuthContext);

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [role, setRole] = useState("user");
    const [serverError, setServerError] = useState("");

    function handleFormData(e) {
        const key = e.target.name;
        const value = e.target.value;
        setFormData({ ...formData, [key]: value});
    }
   
    async function handleSubmit(e) {
        e.preventDefault();
        const result = await handleLogin(formData, role);

        if (result.success) {
            setFormData({ email: "", password: "" });
            setServerError("");
            if (role === "user") {
                if (result.hasProfile) {
                    navigate("/user/dashboard");
                } else {
                    navigate("/user/create-profile");
                }
            } else if (role === "mentor") {
                if (result.hasProfile) {
                    navigate("/mentor/dashboard");
                } else {
                    navigate("/mentor/create-profile");
                }
            }
        } else {
            setServerError(result.message);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <button type="button" onClick={() => setRole("user")} >  User  </button>{" "}<button type="button" onClick={() => setRole("mentor")} > Mentor </button> <br />
                <h2> Login as {role === "user" ? "User" : "Mentor"} </h2>
                {serverError && ( <p style={{ color: "red" }}> {serverError}  </p> )}

                <label>Email:</label>
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleFormData} required />
                    <br />
                <label>Password:</label>
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleFormData} required />
                    <br />
                    <p><Link to="/register">Sign Up</Link></p>
                <button type="submit"> Login </button>
            </form>
        </>
    );
}