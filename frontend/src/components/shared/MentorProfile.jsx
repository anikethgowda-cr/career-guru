import { useState } from "react";
import { jobRoles, specializations } from "../../constants/jobOptions";
import { createProfile } from "../../slices/ProfileSlice";
import { useDispatch ,useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const languages = [
    "English",
    "Hindi",
    "Kannada",
    "Tamil",
    "Telugu",
    "Malayalam"
];

const MentorProfileForm = () => {
    const dispatch =useDispatch()
    const navigate =useNavigate()

    const {user} = useSelector((state)=>{
        return state.auth
    })

    const [formData, setFormData] = useState({
        name: "",
        education: "",
        workType: "",
        experience: "",
        expertIn: [],
        specialization: [],
        bio: "",
        languages: [],
        organization: "",
        designation: "",
        origin: ""
    });

    const handleChange = (e) => {
        const { name, value, selectedOptions, multiple } = e.target;

        const values = multiple
            ? Array.from(selectedOptions, option => option.value)
            : value;

        setFormData(prev => {
            if (name === "workType") {
                return {
                    ...prev,
                    workType: value,
                    organization: "",
                    designation: "",
                    origin: ""
                };
            }

            if (name === "expertIn") {
                const available = [
                    ...new Set(
                        values.flatMap(
                            role => specializations[role] || []
                        )
                    )
                ];

                return {
                    ...prev,
                    expertIn: values,
                    specialization: prev.specialization.filter(
                        item => available.includes(item)
                    )
                };
            }

            return {
                ...prev,
                [name]: values
            };
        });
    };

    const handleCheckboxChange = (e, type) => {
        const { value, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [type]: checked
                ? [...prev[type], value]
                : prev[type].filter(item => item !== value)
        }));
    };

    const availableSpecializations = [
        ...new Set(
            formData.expertIn.flatMap(
                role => specializations[role] || []
            )
        )
    ];

    async function handleSubmit(e){
        e.preventDefault();
        console.log(formData);
        try{
            dispatch(createProfile({profileData:formData,role:user.role})).unwrap()
            navigate("/mentor/dashboard")
        }catch(err){
            console.log(err)
        } 
    };

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-zinc-950 text-slate-900 dark:text-white transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-8 text-left">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30">
                        CG
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Complete Your Mentor Profile
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                        Share your industry experience and specialized domain expertise to start mentoring tomorrow's tech leaders.
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
                >
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 pb-2 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                            Personal & Professional Background
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Jane Doe"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Education / Degree
                                </label>
                                <input
                                    type="text"
                                    name="education"
                                    value={formData.education}
                                    onChange={handleChange}
                                    placeholder="e.g. B.Tech Computer Science"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Work Type
                                </label>
                                <select
                                    name="workType"
                                    value={formData.workType}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                >
                                    <option value="">Select work type</option>
                                    <option value="employee">Employee</option>
                                    <option value="self-employed">Self Employed</option>
                                    <option value="freelancer">Freelancer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    name="experience"
                                    min="0"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    placeholder="e.g. 5"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        {formData.workType === "employee" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Organization / Company
                                    </label>
                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        placeholder="e.g. Google, Amazon"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Designation / Title
                                    </label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.workType === "self-employed" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Business / Profession
                                    </label>
                                    <input
                                        type="text"
                                        name="origin"
                                        value={formData.origin}
                                        onChange={handleChange}
                                        placeholder="e.g. Tech Consultancy"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="e.g. Founder / Director"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {formData.workType === "freelancer" && (
                            <div className="pt-1">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                    Designation / Focus
                                </label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    placeholder="e.g. Freelance Full-Stack Architect"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {/* Expertise & Specializations */}
                    <div className="space-y-4 pt-4 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 pb-2 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                            Domains & Specializations
                        </h3>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Expert In (Target Roles)
                                </label>
                                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                                    Hold Ctrl / Cmd to select multiple
                                </span>
                            </div>
                            <select
                                name="expertIn"
                                value={formData.expertIn}
                                onChange={handleChange}
                                multiple
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm h-32 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            >
                                {jobRoles.map((role) => (
                                    <option key={role.value} value={role.value} className="py-1 px-2">
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {formData.expertIn.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                                    Specializations
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {availableSpecializations.map((item) => {
                                        const isChecked = formData.specialization.includes(item);
                                        return (
                                            <label
                                                key={item}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                                    isChecked
                                                        ? "bg-indigo-50 dark:bg-zinc-800 border-indigo-200 dark:border-zinc-600 text-slate-900 dark:text-white"
                                                        : "bg-slate-50/60 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    value={item}
                                                    checked={isChecked}
                                                    onChange={(e) => handleCheckboxChange(e, "specialization")}
                                                    className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500/20"
                                                />
                                                <span className="truncate">{item}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bio & Languages */}
                    <div className="space-y-4 pt-4 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 pb-2 border-b border-[#E2E8F0]/80 dark:border-zinc-800/80">
                            Bio & Communication
                        </h3>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                                Bio & Mentorship Style
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Introduce yourself, your engineering philosophy, and what mentees can expect from sessions..."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                                Spoken Languages
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {languages.map((language) => {
                                    const isSelected = formData.languages.includes(language);
                                    return (
                                        <label
                                            key={language}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                                isSelected
                                                    ? "bg-indigo-50 dark:bg-zinc-800 border-indigo-200 dark:border-zinc-600 text-slate-900 dark:text-white"
                                                    : "bg-slate-50/60 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                value={language}
                                                checked={isSelected}
                                                onChange={(e) => handleCheckboxChange(e, "languages")}
                                                className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500/20"
                                            />
                                            <span>{language}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-[#E2E8F0]/80 dark:border-zinc-800/80">
                        <button
                            type="submit"
                            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-600 dark:to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:hover:from-indigo-500 dark:hover:to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 cursor-pointer text-center"
                        >
                            Save & Activate Mentor Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default MentorProfileForm;