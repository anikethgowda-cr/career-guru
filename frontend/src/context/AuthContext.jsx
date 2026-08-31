import { createContext, useReducer } from "react";
import reducer from "../auth-reducer/AuthReducer";
export const AuthContext=createContext()


const initialState={
    isLoggedIn:false,
    user:null
}


export function AuthProvider({children}){
    
const[state,dispatch]=useReducer(reducer ,initialState)



    return(
        <>
        <AuthContext.Provider value={{...state,dispatch}}>
            {children}
        </AuthContext.Provider>
        
        </>
    )

}


