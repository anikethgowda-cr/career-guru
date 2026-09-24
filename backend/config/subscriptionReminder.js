import cron from "node-cron";
import Subscription from "../models/subscriptionSchema.js";
import User from "../models/userSchema.js";
import MentorProfile from "../models/mentorProfileSchema.js";
import transporter from "./email.js";

const sendSubscriptionReminders = async () => {
    try {

        const now = new Date();

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const subscriptions = await Subscription.find({
            status: "active",
            reminderSent: false,
            endDate: {
                $gt: now,
                $lte: tomorrow
            }
        });

        for (const subscription of subscriptions) {

            const student = await User.findById(
                subscription.studentId
            );

            if (!student || !student.email) {
                continue;
            }

            const mentor = await MentorProfile.findOne({
                userId: subscription.mentorId
            });

            const mentorName = mentor
                ? mentor.name
                : "your mentor";

            await transporter.sendMail({
                from: process.env.MAIL_USER,
                to: student.email,
                subject: "Your CareerGuru mentor subscription expires tomorrow",
                text: `Hello ${student.username},

                    Your mentor subscription with ${mentorName} will expire tomorrow.

                    Renew your subscription to continue accessing your mentor and your previous conversation.

                    Thank you,
                    CareerGuru Team`
            });

            subscription.reminderSent = true;

            await subscription.save();

            console.log(
                `Subscription reminder sent to ${student.email}`
            );
        }

    } catch (error) {
        console.error(
            "SUBSCRIPTION REMINDER ERROR:",
            error
        );
    }
};

// Run every hour
cron.schedule("0 * * * *", sendSubscriptionReminders);

export default sendSubscriptionReminders;