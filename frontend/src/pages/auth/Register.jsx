import { useState } from "react";
import axios from "../../config/axios-config";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: "", email: "", password: "", phone: "" });
    const [role, setRole] = useState("user");
    const [serverError, setServerError] = useState("");

    function handleFormData(e) {
        const key = e.target.name;
        const value = e.target.value;
        setFormData({ ...formData, [key]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const endpoint = role === "user" ? "/user/register" : "/mentor/register";
        try {
            await axios.post(endpoint, formData);
            setFormData({
                username: "",
                email: "",
                password: "",
                phone: ""
            });
            setTimeout(() => {
                navigate("/login");
            }, 1000);

            setServerError("");
        } catch (err) {
            const message = err.response?.data?.message || "Something went wrong";
            setServerError(message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-app p-4 sm:p-6 transition-colors duration-200 relative">
            <div className="w-full max-w-md bg-bg-surface rounded-xl shadow-xs border border-border-default p-6 sm:p-8 transition-colors duration-200">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white p-1 border border-border-default mb-3">
                        <img src="/careerguru.png" alt="CareerGuru" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-text-primary">
                        Create an Account
                    </h1>
                    <p className="text-xs sm:text-sm text-text-secondary mt-1">
                        Join CareerGuru as a <span className="font-medium text-brand-primary capitalize">{role}</span>
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-bg-muted rounded-lg mb-6 border border-border-default/80">
                    <button
                        type="button"
                        onClick={() => setRole("user")}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            role === "user"
                                ? "bg-bg-surface text-text-primary shadow-xs border border-border-default/60 font-semibold"
                                : "text-text-muted hover:text-text-primary"
                        }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("mentor")}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            role === "mentor"
                                ? "bg-bg-surface text-text-primary shadow-xs border border-border-default/60 font-semibold"
                                : "text-text-muted hover:text-text-primary"
                        }`}
                    >
                        Mentor
                    </button>
                </div>

                {/* Error Banner */}
                {serverError && (
                    <div className="mb-5 p-3 rounded-md bg-status-danger-subtle border border-status-danger/20 text-xs text-status-danger flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{serverError}</span>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Enter your username"
                            name="username"
                            value={formData.username}
                            onChange={handleFormData}
                            className="w-full px-3 py-2 rounded-md border border-border-default bg-bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            name="email"
                            value={formData.email}
                            onChange={handleFormData}
                            className="w-full px-3 py-2 rounded-md border border-border-default bg-bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="Create a strong password"
                            name="password"
                            value={formData.password}
                            onChange={handleFormData}
                            className="w-full px-3 py-2 rounded-md border border-border-default bg-bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-text-secondary mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            required
                            placeholder="e.g. +91 9876543210"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormData}
                            className="w-full px-3 py-2 rounded-md border border-border-default bg-bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 py-2 px-4 rounded-md bg-brand-primary hover:bg-brand-primary-hover text-white font-medium text-sm transition-colors shadow-xs cursor-pointer"
                    >
                        Register as {role === "user" ? "Student" : "Mentor"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs sm:text-sm text-text-secondary mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-brand-primary hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}