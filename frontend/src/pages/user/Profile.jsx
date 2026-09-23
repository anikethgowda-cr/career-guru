import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfileDetails } from "../../slices/ProfileSlice";
import ProfileDetails from "../../components/user/profile/ProfileDetails";
import MentorProfileDetails from "../../components/mentor/profile/MentorProfileDetails";

export default function Profile() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const { data, loading, error } = useSelector((state) => state.profile);

    useEffect(() => {
        if (user?.role) {
            dispatch(fetchProfileDetails(user.role));
        }
    }, [dispatch, user?.role]);

    // Shimmer Skeleton Loader
    if (loading) {
        return (
            <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-8 text-left animate-pulse">
                <div className="h-32 bg-bg-surface border border-border-default rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-bg-muted rounded-2xl"></div>
                    <div className="space-y-2 flex-1">
                        <div className="w-48 h-5 bg-bg-muted rounded"></div>
                        <div className="w-64 h-3.5 bg-bg-muted/60 rounded"></div>
                    </div>
                </div>

                <div className="bg-bg-surface border border-border-default rounded-2xl p-8 space-y-6">
                    <div className="w-40 h-5 bg-bg-muted rounded"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="space-y-2">
                                <div className="w-24 h-3.5 bg-bg-muted rounded"></div>
                                <div className="h-10 bg-bg-muted/50 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="p-6 sm:p-8 max-w-xl mx-auto mt-10">
                <div className="p-6 rounded-2xl bg-status-danger-subtle border border-status-danger-border text-left space-y-3">
                    <h3 className="text-base font-bold text-status-danger">
                        Failed to load profile
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchProfileDetails(user?.role || "user"))}
                        className="px-4 py-2 rounded-xl bg-status-danger hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 sm:p-8 max-w-xl mx-auto mt-10">
                <div className="p-8 rounded-2xl bg-bg-surface border border-border-default text-center space-y-3">
                    <h3 className="text-base font-bold text-text-primary">
                        No Profile Found
                    </h3>
                    <p className="text-xs text-text-muted">
                        Please set up your profile to personalize your AI career intelligence.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-5xl mx-auto transition-colors duration-300">
            {user?.role === "user" && <ProfileDetails data={data} />}
            {user?.role === "mentor" && <MentorProfileDetails data={data} />}
        </div>
    );
}