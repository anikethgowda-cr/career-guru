import cron from "node-cron";
import Subscription from "../models/subscriptionSchema.js";

const expireSubscriptions = async () => {
    try {
        const result = await Subscription.updateMany(
            {
                status: "active",
                endDate: { $lte: new Date() }
            },
            {
                $set: {
                    status: "expired"
                }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(
                `Expired subscriptions: ${result.modifiedCount}`
            );
        }

    } catch (error) {
        console.error(
            "SUBSCRIPTION EXPIRATION ERROR:",
            error
        );
    }
};

cron.schedule("0 * * * *", expireSubscriptions);

export default expireSubscriptions;