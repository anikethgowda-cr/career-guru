import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { checkMentorAccess } from "../../slices/user/PaymentSlice";
import { loginUser } from "../../slices/AuthSlice";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme, toggleTheme } = useTheme();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [role, setRole] = useState("user");
    const [serverError, setServerError] = useState("");

    function handleFormData(e) {
        const key = e.target.name;
        const value = e.target.value;
        setFormData({ ...formData, [key]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setServerError("");

        try {
            const result = await dispatch(loginUser({ formData, role })).unwrap();
            dispatch(checkMentorAccess());
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
            setServerError(err.message || "Something went wrong");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-app p-4 sm:p-6 transition-colors duration-200 relative">
            {/* Top Right Theme Toggle */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2.5 rounded-lg bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary shadow-subtle hover:shadow-card transition-all cursor-pointer"
                    title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <svg className="w-5 h-5 text-status-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </div>

            <div className="w-full max-w-md bg-bg-surface rounded-xl shadow-card border border-border-default p-6 sm:p-8 transition-colors duration-200">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-subtle text-brand-primary mb-3 font-bold text-xl shadow-xs">
                        CG
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                        Sign in to CareerGuru as a <span className="font-semibold text-brand-primary capitalize">{role}</span>
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-bg-muted rounded-lg mb-6 border border-border-default">
                    <button
                        type="button"
                        onClick={() => setRole("user")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                            role === "user"
                                ? "bg-bg-surface text-text-primary shadow-xs font-bold"
                                : "text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("mentor")}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                            role === "mentor"
                                ? "bg-bg-surface text-text-primary shadow-xs font-bold"
                                : "text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        Mentor
                    </button>
                </div>

                {/* Error Banner */}
                {serverError && (
                    <div className="mb-5 p-3.5 rounded-lg bg-status-danger-subtle border border-status-danger/30 text-sm text-status-danger flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{serverError}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleFormData}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-bg-app text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-brand-ring focus:border-brand-primary text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleFormData}
                            required
                            className="w-full px-3.5 py-2.5 rounded-lg border border-border-default bg-bg-app text-text-primary placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-brand-ring focus:border-brand-primary text-sm transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 py-2.5 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer"
                    >
                        Sign in as {role === "user" ? "Student" : "Mentor"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-text-secondary mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
