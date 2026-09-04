import { useState } from "react";
import { jobRoles, specializations } from "../constants/jobOptions";
import { createProfile } from "../slices/ProfileSlice";
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
        <form onSubmit={handleSubmit} className="mentor-profile-form">

            <div className="form-group">
                <label>Name</label>
                <input name="name" value={formData.name} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Education</label>
                <input name="education" value={formData.education} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Work Type</label>
                <select name="workType" value={formData.workType} onChange={handleChange}>
                    <option value="">Select work type</option>
                    <option value="employee">Employee</option>
                    <option value="self-employed">Self Employed</option>
                    <option value="freelancer">Freelancer</option>
                </select>
            </div>

            {formData.workType === "employee" && (
                <>
                    <div className="form-group">
                        <label>Organization</label>
                        <input name="organization" value={formData.organization} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Designation</label>
                        <input name="designation" value={formData.designation} onChange={handleChange} />
                    </div>
                </>
            )}

            {formData.workType === "self-employed" && (
                <>
                    <div className="form-group">
                        <label>Business / Profession</label>
                        <input name="origin" value={formData.origin} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Designation</label>
                        <input name="designation" value={formData.designation} onChange={handleChange} />
                    </div>
                </>
            )}

            {formData.workType === "freelancer" && (
                <div className="form-group">
                    <label>Designation</label>
                    <input name="designation" value={formData.designation} onChange={handleChange} />
                </div>
            )}

            <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" name="experience" min="0" value={formData.experience} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label>Expert In </label>
                <small>cltr + click for multiple select</small>

                <select name="expertIn"  value={formData.expertIn} onChange={handleChange} multiple>
                    {jobRoles.map(role => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
            </div>

            {formData.expertIn.length > 0 && (
                <div className="form-group">
                    <label>Specialization</label>

                    <div className="checkbox-container">
                        {availableSpecializations.map(item => (
                            <label key={item} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    value={item}
                                    checked={formData.specialization.includes(item)}
                                    onChange={(e) =>
                                        handleCheckboxChange(e, "specialization")
                                    }
                                />
                                {item}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows="5" />
            </div>

            <div className="form-group">
                <label>Languages</label>

                <div className="checkbox-container">
                    {languages.map(language => (
                        <label key={language} className="checkbox-item">
                            <input
                                type="checkbox"
                                value={language}
                                checked={formData.languages.includes(language)}
                                onChange={(e) =>
                                    handleCheckboxChange(e, "languages")
                                }
                            />
                            {language}
                        </label>
                    ))}
                </div>
            </div>

            <button type="submit">Save Profile</button>

        </form>
    );
};

export default MentorProfileForm;