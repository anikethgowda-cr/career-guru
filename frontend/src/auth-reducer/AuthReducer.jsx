export default function reducer(state, action) {
    switch (action.type) {
        case "LOGIN":
            return {...state, isLoggedIn:true, user:action.payload };

        case "LOGOUT":
            return {...state, isLoggedIn:false, user:null };

        case "AUTH_CHECK_COMPLETE":
            return { ...state, loading:false };

        default:
            throw new Error("Invalid action type");
    }
}