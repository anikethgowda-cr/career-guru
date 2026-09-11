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
                <div className="h-32 bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
                    <div className="space-y-2 flex-1">
                        <div className="w-48 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                        <div className="w-64 h-3.5 bg-slate-200/60 dark:bg-zinc-800/60 rounded"></div>
                    </div>
                </div>

                <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-8 space-y-6">
                    <div className="w-40 h-5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <div key={n} className="space-y-2">
                                <div className="w-24 h-3.5 bg-slate-200 dark:bg-zinc-800 rounded"></div>
                                <div className="h-10 bg-slate-200/50 dark:bg-zinc-800/50 rounded-xl"></div>
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
                <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-left space-y-3">
                    <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                        Failed to load profile
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => dispatch(fetchProfileDetails(user?.role || "user"))}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
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
                <div className="p-8 rounded-3xl bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-center space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        No Profile Found
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
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