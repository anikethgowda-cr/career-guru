import { useNavigate } from "react-router-dom";

export default function QuickAccess() {
    const navigate = useNavigate();

    const quickLinks = [
        {
            title: "Messages",
            subtitle: "Chat with active mentees",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            path: "/mentor/messages",
            badge: "Conversations"
        },
        {
            title: "My Mentees",
            subtitle: "View profiles & reports",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            path: "/mentor/mentees",
            badge: "Students"
        },
        {
            title: "Mentor Profile",
            subtitle: "Update expertise & bio",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            path: "/mentor/profile",
            badge: "Settings"
        }
    ];

    return (
        <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 transition-all duration-300 shadow-xs text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Quick Access
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickLinks.map((item) => (
                    <button
                        key={item.title}
                        type="button"
                        onClick={() => navigate(item.path)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-indigo-100 dark:border-zinc-700/60 transition-all duration-200 text-left cursor-pointer group shadow-2xs"
                    >
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                                    {item.title}
                                </span>
                                <span className="text-[10px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-zinc-700 text-indigo-700 dark:text-zinc-300">
                                    {item.badge}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 truncate block mt-0.5">
                                {item.subtitle}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

