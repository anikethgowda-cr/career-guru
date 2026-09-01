import { useEffect, createContext, useReducer } from "react";
import reducer from "../auth-reducer/AuthReducer";
import axios from "../config/axios-config";

export const AuthContext = createContext();

const initialState = {
    isLoggedIn: false,
    user: null,
    loading: true
};

export function AuthProvider({ children }) {

    const [state, dispatch] = useReducer(reducer, initialState);
    console.log(state)
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || !role) {
            dispatch({ type: "AUTH_CHECK_COMPLETE" });
            return;
        }
        const userEndpoint = role === "user" ? "/user/me" : "/mentor/me";

        axios.get(userEndpoint)
            .then((response) => {
                dispatch({ type: "LOGIN", payload: response.data.data });
                dispatch({ type: "AUTH_CHECK_COMPLETE"});
            })
            .catch(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                dispatch({ type: "LOGOUT" });
                dispatch({ type: "AUTH_CHECK_COMPLETE" });
            });
    }, []);

    /* console.log(state?.user?._id) */
    async function handleLogin(formData, role) {

        const endpoint = role === "user" ? "/user/login" : "/mentor/login";
        try {
            const response = await axios.post(endpoint, formData);
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", role);

            const userEndpoint = role === "user" ? "/user/me" : "/mentor/me";
            const userResponse = await axios.get(userEndpoint);
            dispatch({ type: "LOGIN", payload: userResponse.data.data });

            const profileEndpoint = role === "user" ? "/user/profile" : "/mentor/profile";

            const profileResponse = await axios.get(profileEndpoint);
            
            dispatch({ type: "AUTH_CHECK_COMPLETE" });

            return {
                success: true,
                hasProfile: profileResponse.data.hasProfile
            };
        } catch (err) {
            console.log(err.response);
            const message =err.response?.data?.message || "Something went wrong";
            return {
                success: false,
                message
            };
        }
    }

    function handleLogout() {

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        dispatch({ type: "LOGOUT" });
    }

    return (
        <AuthContext.Provider
            value={{
                ...state,
                handleLogin,
                handleLogout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}