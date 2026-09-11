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
    
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4 sm:p-6">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8">
                
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3 font-bold text-xl shadow-sm">
                        CG
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Create an Account
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                        Join CareerGuru as a <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{role}</span>
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="flex p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setRole("user")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                            role === "user"
                                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold"
                                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("mentor")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                            role === "mentor"
                                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm font-semibold"
                                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        Mentor
                    </button>
                </div>

                {/* Error Banner */}
                {serverError && (
                    <div className="mb-5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{serverError}</span>
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Enter your username"
                            name="username"
                            value={formData.username}
                            onChange={handleFormData}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            name="email"
                            value={formData.email}
                            onChange={handleFormData}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="Create a strong password"
                            name="password"
                            value={formData.password}
                            onChange={handleFormData}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1.5">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            required
                            placeholder="e.g. +91 9876543210"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormData}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                        Register as {role === "user" ? "User" : "Mentor"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 dark:text-zinc-400 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}