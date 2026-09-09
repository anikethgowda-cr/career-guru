import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function MentorAccessRoute() {
    const { hasAccess, loading } = useSelector((state) => {
        return state.payment;
    });

    if (loading) {
        return <p>Checking mentor access...</p>;
    }

    if (!hasAccess) {
        return <Navigate to="/user/mentor-payment" replace />;
    }

    return <Outlet />;
}