import { useSelector } from "react-redux"

export default function TotalConversations(){
    const { stats, loading } = useSelector((state) => state.mentorDashboard);

    if (loading) {
        return <p>loading ....</p>;
    }

    return (
        <div>
            Total Conversations - {stats?.totalConversations ?? 0}
        </div>
    );
}