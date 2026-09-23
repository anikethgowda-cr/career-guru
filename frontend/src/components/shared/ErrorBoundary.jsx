import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 sm:p-8 lg:p-10 max-w-2xl mx-auto my-12 text-left">
                    <div className="bg-bg-surface border border-border-default border-t-4 border-t-status-danger rounded-2xl p-8 shadow-sm space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-status-danger-subtle text-status-danger flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-text-primary">
                                Something went wrong
                            </h2>
                            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                                An unexpected error occurred while rendering this page component. Your session and account data remain safe.
                            </p>
                        </div>

                        {this.state.error?.message && (
                            <div className="p-3.5 rounded-xl bg-status-danger-subtle border border-status-danger-border text-xs font-mono text-status-danger break-all">
                                {this.state.error.message}
                            </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                                Reload Page
                            </button>
                            <a
                                href="/user/dashboard"
                                className="px-4 py-2 rounded-xl bg-bg-muted hover:bg-bg-surface text-text-secondary text-xs font-semibold border border-border-default transition-all cursor-pointer"
                            >
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
