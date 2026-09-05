import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfileDetails } from "../../slices/ProfileSlice";
import ProfileDetails from "../../components/user/profile/ProfileDetails";
import MentorProfileDetails from "../../components/mentor/profile/MentorProfileDetails";

export default function Profile() {
    const dispatch = useDispatch();

    const { user } = useSelector((state) => {
        return state.auth;
    });

    const { data, loading } = useSelector((state) => {
        return state.profile;
    });

    useEffect(() => {
        if (user?.role) {
            dispatch(fetchProfileDetails(user.role));
        }
    }, [dispatch, user?.role]);

    if (loading) {
        return <p>Loading.....</p>;
    }

    if (!data) {
        return <p>Profile not found</p>;
    }

    return (
        <>
            {user?.role === "user" && <ProfileDetails data={data} />}

            {user?.role === "mentor" && <MentorProfileDetails data={data} />}
        </>
    );
}