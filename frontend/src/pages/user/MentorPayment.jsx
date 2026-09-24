import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createPaymentOrder, verifyPayment } from "../../slices/user/PaymentSlice";
import axios from "../../config/axios-config";

export default function MentorPayment() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { mentorId } = useParams();

    const { paymentLoading, error, duplicateSubscription } = useSelector((state) => state.payment);
    const [localError, setLocalError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [mentorInfo, setMentorInfo] = useState(null);
    const [planInfo, setPlanInfo] = useState(null);
    const [infoLoading, setInfoLoading] = useState(true);

    // Fetch mentor profile and plan pricing
    useEffect(() => {
        if (!mentorId) return;
        setInfoLoading(true);
        Promise.all([
            axios.get(`/mentors/${mentorId}`).catch(() => null),
            axios.get(`/mentor-plan/${mentorId}`).catch(() => null)
        ]).then(([mentorRes, planRes]) => {
            if (mentorRes?.data) setMentorInfo(mentorRes.data.mentor || mentorRes.data);
            if (planRes?.data) setPlanInfo(planRes.data.plan || planRes.data);
            setInfoLoading(false);
        });
    }, [mentorId]);

    async function handlePayment() {
        setLocalError("");
        setSuccessMessage("");

        try {
            const result = await dispatch(createPaymentOrder({ mentorId })).unwrap();
            const { orderId, amount, currency } = result;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: "CareerGuru",
                description: `30-day Mentorship with ${mentorInfo?.name || "your mentor"}`,
                order_id: orderId,

                handler: async function (paymentResponse) {
                    try {
                        await dispatch(
                            verifyPayment({
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_signature: paymentResponse.razorpay_signature
                            })
                        ).unwrap();

                        setSuccessMessage("Payment successful! Subscription activated.");
                        setTimeout(() => {
                            navigate(`/user/mentor/chat/${mentorId}`, {
                                state: {
                                    mentorName: mentorName,
                                    mentorInitial: mentorName.charAt(0).toUpperCase()
                                }
                            });
                        }, 1200);

                    } catch (err) {
                        console.error(err);
                        setLocalError(err?.message || "Payment verification failed. Please contact support.");
                    }
                },

                modal: {
                    ondismiss: function () {
                        setLocalError("Payment process cancelled.");
                    }
                },

                theme: {
                    color: "#D97706"
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (err) {
            console.error(err);
            // duplicateSubscription is already set in Redux by the slice, no need to set localError here
            if (!err?.endDate) {
                setLocalError(err?.message || "Could not initiate payment. Please try again.");
            }
        }
    }

    const price = planInfo?.price ?? null;
    const mentorName = mentorInfo?.name || mentorInfo?.username || "Your Mentor";

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-3xl mx-auto space-y-8 text-left transition-colors duration-300">
            {/* Header Banner */}
            <div className="text-center space-y-2 pb-6 border-b border-border-default">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-indigo-700 text-white mx-auto flex items-center justify-center shadow-lg shadow-brand-primary/20">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                    {infoLoading ? "Loading Mentor Details..." : `Subscribe to ${mentorName}`}
                </h1>
                <p className="text-xs sm:text-sm text-text-muted max-w-lg mx-auto">
                    Get 30 days of 1-on-1 direct access — chat, guidance, code reviews, and career coaching.
                </p>
            </div>

            {/* Duplicate Subscription Banner */}
            {duplicateSubscription && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-800/30 text-amber-600 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300">
                            You already have an active subscription with this mentor!
                        </p>
                        {duplicateSubscription.endDate && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                                Your subscription is active until{" "}
                                <strong>{new Date(duplicateSubscription.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>.
                            </p>
                        )}
                        <button
                            onClick={() => navigate("/user/mentor-chat")}
                            className="mt-2 text-[11px] font-bold text-brand-primary hover:underline"
                        >
                            Go to chat →
                        </button>
                    </div>
                </div>
            )}

            {/* Error Alert */}
            {(localError || (error && !duplicateSubscription)) && (
                <div className="p-4 rounded-xl bg-status-danger-subtle border border-status-danger-border flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-xl bg-status-danger-subtle text-status-danger flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-xs sm:text-sm text-status-danger font-medium">
                        {localError || error?.message || "Payment process could not be completed."}
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="p-4 rounded-xl bg-status-success-subtle border border-status-success-border flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-xl bg-status-success-subtle text-status-success flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1 text-xs sm:text-sm text-status-success font-semibold">
                        {successMessage} Redirecting to your chat...
                    </div>
                </div>
            )}

            {/* Plan Card */}
            <div className="bg-bg-surface border border-border-default rounded-2xl p-6 sm:p-8 shadow-xs space-y-7 text-left">
                {/* What's Included */}
                <div className="space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                        What&apos;s Included in Your 30-Day Subscription:
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {[
                            { title: "Direct 1-on-1 Chat", desc: "Real-time messaging with your mentor anytime." },
                            { title: "Resume & Career Coaching", desc: "High-impact critique on your CV and portfolio." },
                            { title: "Personalized Learning Roadmap", desc: "Custom week-by-week milestone tracking." },
                            { title: "30-Day Full Access", desc: "Renew anytime to keep the connection going." }
                        ].map(({ title, desc }) => (
                            <div key={title} className="flex items-start gap-3 p-3.5 rounded-xl bg-bg-app border border-border-default">
                                <span className="w-6 h-6 rounded-lg bg-status-success-subtle text-status-success flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-bold text-text-primary">{title}</h4>
                                    <p className="text-[11px] text-text-muted mt-0.5">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing Block */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-brand-subtle via-brand-subtle/40 to-transparent border border-brand-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary">
                                30-day subscription
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            {infoLoading ? (
                                <span className="text-3xl sm:text-4xl font-black text-text-muted animate-pulse">₹—</span>
                            ) : price !== null ? (
                                <>
                                    <span className="text-3xl sm:text-4xl font-black text-text-primary">₹{price}</span>
                                    <span className="text-xs text-text-muted font-medium">/ month</span>
                                </>
                            ) : (
                                <span className="text-sm text-status-danger font-semibold">Plan unavailable</span>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        id="pay-now-btn"
                        onClick={handlePayment}
                        disabled={paymentLoading || infoLoading || price === null || !!duplicateSubscription}
                        className="px-7 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm shadow-md shadow-brand-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {paymentLoading ? (
                            <>
                                <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Securing Order...</span>
                            </>
                        ) : (
                            <>
                                <span>Pay {price !== null ? `₹${price}` : ""} & Start Mentorship</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Security Footnote */}
                <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-1">
                    <svg className="w-4 h-4 text-status-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Processed securely via 256-bit encrypted Razorpay checkout</span>
                </div>
            </div>
        </div>
    );
}