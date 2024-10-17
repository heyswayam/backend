import { Router } from "express";
import { currentSubscriptionStatus, toggleSubscription, getSubscribedChannels,getChannelSubscribers } from "../controllers/subscription.controller.js";
import { verifyJWTToken } from "../middlewares/auth.middleware.js";
const SubscriptionRoute = Router();


SubscriptionRoute.route('/status/:channelId').get(verifyJWTToken,currentSubscriptionStatus );
SubscriptionRoute.route('/toggle/:channelId').post(verifyJWTToken,toggleSubscription );
SubscriptionRoute.route('/subscribed-channels').get(verifyJWTToken,getSubscribedChannels );
SubscriptionRoute.route('/total-subscribers').get(verifyJWTToken,getChannelSubscribers );

export {SubscriptionRoute};