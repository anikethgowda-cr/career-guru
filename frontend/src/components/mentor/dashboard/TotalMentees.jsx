import { useSelector } from "react-redux"

export default function TotalMentees(){
    const { stats, loading } = useSelector((state) => state.mentorDashboard);

    if (loading) {
        return <p>loading...</p>;
    }

    return (
        <div>
            Total Mentees - {stats?.totalMentees ?? 0}
        </div>
    );
}