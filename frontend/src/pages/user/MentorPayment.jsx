import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPaymentOrder, verifyPayment } from "../../slices/user/PaymentSlice";

export default function MentorPayment() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { paymentLoading, error } = useSelector((state) => {
        return state.payment;
    });

    async function handlePayment() {
        try {
            const result = await dispatch(createPaymentOrder()).unwrap();

            const { orderId, amount, currency } = result;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: "CareerPilot",
                description: "Mentor Access",
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

                        alert("Payment successful!");

                        navigate("/user/explore-mentors");

                    } catch (err) {
                        console.error(err);
                    }
                },

                modal: {
                    ondismiss: function () {
                    }
                }
            };

            const razorpay = new window.Razorpay(options);

            razorpay.open();

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <h1>Unlock Mentor Access</h1>

            {error && <p>{error.message}</p>}

            <p>Get access to mentors and personalized career guidance.</p>

            <h2>₹99</h2>

            <button onClick={handlePayment} disabled={paymentLoading}>
                {paymentLoading ? "Processing..." : "Pay ₹99"}
            </button>
        </>
    );
}