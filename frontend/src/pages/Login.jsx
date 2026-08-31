import { useState } from "react";
import axios from "../config/axios-config";

export default function Login() {
    const [formData, setFormData] = useState({email: "",password: ""})

    const [role, setRole] = useState("user");
    const [serverError, setServerError] = useState("");

    function handleFormData(e) {
        const key = e.target.name;
        const value = e.target.value;
        setFormData({...formData,[key]: value});
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const endpoint =role === "user" ? "/user/login" : "/mentor/login";
        try {
            const response = await axios.post(endpoint, formData);
            console.log(response.data);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", role);
            setFormData({
                email: "",
                password: ""
            });
            setServerError("");

        } catch (err) {
            const message = err.response?.data?.message || "Something went wrong";
            console.log(message);
            setServerError(message);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <button type="button" onClick={() => {setRole("user")}} > User</button> {" "}
                <button type="button" onClick={() => {setRole("mentor")}} > Mentor</button> <br />
                <h2> Login as {role === "user" ? "User" : "Mentor"} </h2>
                {serverError && ( <p style={{ color: "red" }}> {serverError} </p> )}
                <label>Email:</label>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleFormData} required /> <br />
                <label>Password:</label>
                <input type="texta" name="password" placeholder="Password" value={formData.password} onChange={handleFormData} required/> <br />
                <button type="submit">Login </button>
            </form>
        </>
    );
}

