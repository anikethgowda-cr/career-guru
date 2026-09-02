import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../slices/AuthSlice";

export default function Login() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({ email: "", password: "" });

    const [role, setRole] = useState("user");
    const [serverError, setServerError] = useState("");

    function handleFormData(e) {
        const key = e.target.name;
        const value = e.target.value;

        setFormData({ ...formData, [key]: value }) }

    async function handleSubmit(e) {
        e.preventDefault();
        setServerError("");

        try {
            const result = await dispatch( loginUser({ formData, role })).unwrap();
            setFormData({ email: "", password: "" });

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
        } catch (err) {
            setServerError( err.message || "Something went wrong" );
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <button type="button"  onClick={() => setRole("user")} > User</button>{" "} <button type="button" onClick={() => setRole("mentor")}> Mentor </button>
                <br />
                <h2>  Login as {role === "user" ? "User" : "Mentor"} </h2>

                {serverError && ( <p style={{ color: "red" }}> {serverError} </p>)}

                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleFormData}
                    required
                />
                <br />

                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleFormData}
                    required
                />
                <br />
                <p> <Link to="/register"> Sign Up </Link>  </p>
                <button type="submit">  Login  </button>
            </form>
        </>
    );
}

