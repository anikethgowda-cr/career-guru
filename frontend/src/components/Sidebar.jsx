import React from "react";
import "./Sidebar.css";


function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>CareerGuru</h2>
      </div>

      <nav className="sidebar-nav">
        <a href="/dashboard" className="nav-item active">
          <span>🏠</span>
          <span>Dashboard</span>
        </a>

        <a href="/profile" className="nav-item">
          <span>👤</span>
          <span>Profile</span>
        </a>

        <a href="/resume" className="nav-item">
          <span>📄</span>
          <span>Resume </span>
        </a>

        <a href="/jobs" className="nav-item">
          <span>💼</span>
          <span>Jobs</span>
        </a>

        <a href="/mentors" className="nav-item">
          <span>👨‍🏫</span>
          <span>Mentors</span>
        </a>

        <a href="/interview" className="nav-item">
          <span>🎤</span>
          <span>AI Interview</span>
        </a>

        <a href="/chat" className="nav-item">
          <span>💬</span>
          <span>AI Chat</span>
        </a>

        <a href="/applications" className="nav-item">
          <span>📋</span>
          <span>Applications</span>
        </a>
      </nav>

      <div className="sidebar-bottom">
        <a href="/settings" className="nav-item">
          <span>⚙️</span>
          <span>Settings</span>
        </a>

        <button className="logout-btn">
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;