import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkMentorAccess } from "../slices/user/PaymentSlice";

export default function MentorAccessRoute() {
    const dispatch = useDispatch();
    const { hasAccess, loading } = useSelector((state) => state.payment);

    useEffect(() => {
        dispatch(checkMentorAccess());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="flex flex-col items-center gap-3">
                    <svg className="w-7 h-7 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xs text-text-muted font-medium">Checking subscription access...</p>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return <Navigate to="/user/explore-mentors" replace />;
    }

    return <Outlet />;
}