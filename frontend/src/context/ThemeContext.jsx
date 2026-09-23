/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext(undefined);

const STORAGE_KEY = "careerguru-theme";

/**
 * Determines the initial theme without causing a flash.
 * Priority: localStorage > system preference > "dark" default.
 */
function getInitialTheme() {
    if (typeof window === "undefined") return "dark";

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;

    if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
        return "light";
    }
    return "dark";
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    // Sync theme class to <html> and persist to localStorage
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    const value = { theme, toggleTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access current theme and toggle function.
 * Must be used inside <ThemeProvider>.
 */
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (ctx === undefined) {
        throw new Error("useTheme() must be used within a <ThemeProvider>");
    }
    return ctx;
}
