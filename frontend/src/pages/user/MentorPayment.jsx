import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPaymentOrder, verifyPayment } from "../../slices/user/PaymentSlice";

export default function MentorPayment() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { paymentLoading, error } = useSelector((state) => state.payment);
    const [localError, setLocalError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    async function handlePayment() {
        setLocalError("");
        setSuccessMessage("");

        try {
            const result = await dispatch(createPaymentOrder()).unwrap();
            const { orderId, amount, currency } = result;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: "CareerGuru",
                description: "Lifetime Mentor Access Pass",
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

                        setSuccessMessage("Payment verified! Access unlocked.");
                        setTimeout(() => {
                            navigate("/user/explore-mentors");
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
            setLocalError(err?.message || "Could not initiate payment. Please try again.");
        }
    }

    return (
        <div className="p-6 sm:p-8 lg:p-10 max-w-3xl mx-auto space-y-8 text-left transition-colors duration-300">
            {/* Header Banner */}
            <div className="text-center space-y-2 pb-6 border-b border-[#E2E8F0] dark:border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-600 dark:to-indigo-700 text-white mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/20 dark:shadow-indigo-600/30">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Unlock 1-on-1 Mentor Guidance
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-lg mx-auto">
                    Accelerate your career trajectory with unlimited direct access to industry leaders, mock interviews, and code reviews.
                </p>
            </div>

            {/* Error or Success Alerts */}
            {(localError || error) && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1 text-xs sm:text-sm text-red-800 dark:text-red-300">
                        {localError || error?.message || "Payment process could not be completed."}
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold">
                        {successMessage} Redirecting to your mentors...
                    </div>
                </div>
            )}

            {/* Premium Access Card */}
            <div className="bg-[#FFFFFF] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-7 text-left">
                {/* Value Checklist */}
                <div className="space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        What&apos;s Included in Your Lifetime Pass:
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                ✓
                            </span>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    Direct 1-on-1 Chat
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Real-time messaging with experienced engineers and leads.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                ✓
                            </span>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    Resume & Career Coaching
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Get high-impact critique on your CV and portfolio.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                ✓
                            </span>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    Personalized Learning Roadmap
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Custom week-by-week milestone tracking and AI-guided skill mastery.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-[#E2E8F0] dark:border-zinc-800">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                ✓
                            </span>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    Lifetime Mentor Access
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                    Pay once, no recurring monthly subscriptions or hidden fees.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Block */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-indigo-50/30 to-transparent dark:from-indigo-950/40 dark:via-zinc-900 border border-indigo-200/60 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs line-through text-slate-400 dark:text-zinc-500">₹499</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-300">
                                Launch Promo 80% OFF
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">₹99</span>
                            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">one-time payment</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-violet-700 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-600/20 dark:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                                <span>Pay ₹99 & Unlock Access</span>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>

                {/* Security Footnote */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-zinc-400 pt-1">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Processed securely via 256-bit encrypted Razorpay checkout</span>
                </div>
            </div>
        </div>
    );
}