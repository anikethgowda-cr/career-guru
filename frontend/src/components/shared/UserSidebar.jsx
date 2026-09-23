import { NavLink, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/AuthSlice";
import { useTheme } from "../../context/ThemeContext";

export default function UserSidebar() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth?.user);
    const { theme, toggleTheme } = useTheme();

    const displayName = user?.username || user?.name || "Student";
    const displayEmail = user?.email || "student@careerguru.ai";
    const initial = displayName.charAt(0).toUpperCase();

    const navItems = [
        {
            name: "Dashboard",
            path: "/user/dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            name: "Learning Plan",
            path: "/user/learning-plan",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            name: "Interview Questions",
            path: "/user/interview-questions",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            name: "Jobs Board",
            path: "/user/jobs-board",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: "Explore Mentors",
            path: "/user/explore-mentors",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
        {
            name: "My Mentors",
            path: "/user/my-mentors",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
        {
            name: "Assessment",
            path: "/user/assessment",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6.586a2 2 0 011.414.586l3.414 3.414A2 2 0 0119 8.414V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: "Assessment Report",
            path: "/user/assessment-report",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a3 3 0 006 0M9 5h6m-6 8l2 2 4-4" />
                </svg>
            )
        },
        {
            name: "Profile",
            path: "/user/profile",
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        }
    ];

    return (
        <aside className="fixed top-0 left-0 bottom-0 z-40 w-64 bg-bg-surface border-r border-border-default flex flex-col justify-between theme-transition text-left">
            {/* Top Brand Header */}
            <div>
                <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-border-default text-left theme-transition">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-600/25 shrink-0">
                            CG
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-text-primary text-base tracking-tight leading-tight">
                                CareerGuru
                            </span>
                            <span className="text-[11px] font-medium text-text-muted leading-tight">
                                AI Career Intelligence
                            </span>
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-muted hover:bg-border-default text-text-secondary border border-border-default theme-transition cursor-pointer shadow-subtle shrink-0"
                        title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label="Toggle Color Theme"
                    >
                        {theme === "dark" ? (
                            <svg className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-brand-primary transition-transform duration-300 hover:-rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="p-3 space-y-0.5 text-left">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                                    isActive
                                        ? "bg-brand-subtle text-brand-primary font-semibold"
                                        : "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
                                }`
                            }
                        >
                            <span className="shrink-0">{item.icon}</span>
                            <span className="truncate">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Bottom Actions Area */}
            <div className="p-3 border-t border-border-default text-left theme-transition space-y-2">
                {/* Mini User Profile Capsule */}
                <Link
                    to="/user/profile"
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-muted hover:bg-border-default border border-border-default transition-all duration-200 group text-left"
                    title="View Profile Settings"
                >
                    <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                            {initial}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 ring-2 ring-bg-surface rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-text-primary truncate group-hover:text-brand-primary transition-colors">
                                {displayName}
                            </p>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-brand-subtle text-brand-primary border border-border-default shrink-0 capitalize">
                                {user?.role || "student"}
                            </span>
                        </div>
                        <p className="text-[11px] text-text-muted truncate">
                            {displayEmail}
                        </p>
                    </div>
                </Link>

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={() => dispatch(logout())}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-status-danger hover:bg-status-danger-subtle transition-colors cursor-pointer text-left"
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}
