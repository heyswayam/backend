import mongoose, { isValidObjectId, Types } from 'mongoose';
import { User } from '../models/user.model.js';
import { Video } from '../models/video.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Subscription } from '../models/subscription.model.js';

const currentSubscriptionStatus = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid channel ID');
    }
    const isSubscribed = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
                subscriber: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $project: {
                _id: 1,
            },
        },
    ]);
    // if(!isSubscribed) throw new ApiError(400,"Can fetch isSubscribed")
    // const subscribed = isSubscribed.length>0;
    const subscribed = isSubscribed.length > 0;
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed },
                'Subscription status retrieved successfully'
            )
        );
});

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    // if (!isValidObjectId(channelId)) {
    //     throw new ApiError(400, 'Invalid channel ID');
    // }

    const subscription = await Subscription.findOne({
        channel: new mongoose.Types.ObjectId(channelId),
        subscriber: new mongoose.Types.ObjectId(userId),
    });

    let subscribed;
    if (subscription) {
        // If subscription exists, delete it
        await Subscription.deleteOne({ _id: subscription._id });
        subscribed = false;
    } else {
        // If subscription does not exist, create it
        await Subscription.create({
            channel: new mongoose.Types.ObjectId(channelId),
            subscriber: new mongoose.Types.ObjectId(userId),
        });
        subscribed = true;
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribed },
                'Subscription status toggled successfully'
            )
        );
});

////////NOT required,since a user will have only ONE CHANNEL (like tweeter,etc)
// controller to return subscriber list of a channel
// const getUserChannels = asyncHandler(async (req, res) => {
//     // const { channelId } = req.params;
//     // if (!isValidObjectId(channelId)) {
//     //     throw new ApiError(400, 'Invalid channel ID');
//     // }
//     const channelList = await Subscription.aggregate([
//         {
//             $match: {
//                 channel: new mongoose.Types.ObjectId(req.user._id),
//                 subscriber: new mongoose.Types.ObjectId(req.user._id),
//             },
//         },
//         {
//             $lookup: {
//                 from: 'users',
//                 foreignField: '_id',
//                 localField: 'subscriber',
//                 as: 'totalChannels',
//             },
//         },
//         {$project:{
//             totalChannels:1,
//             _id:0
//         }}
//     ]);

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 { channelList },
//                 'Subscriber list retrieved successfully'
//             )
//         );
// });


// controller to return total users who has subscribed my channel
const getChannelSubscribers = asyncHandler(async (req,res)=>{
    const subscribersList = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'subscriber',
                as: 'subscribersList',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullname: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                subscribersList: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribersList },
                'Subscriber list retrieved successfully'
            )
        );
})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const subscribedChannelList = await Subscription.aggregate([
        { $match: { subscriber: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: 'users',
                foreignField: '_id',
                localField: 'channel',
                as: 'totalSubscriptions',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            fullname: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                totalSubscriptions: 1,
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { subscribedChannelList },
                'Subscriber list retrieved successfully'
            )
        );
});
export { currentSubscriptionStatus, toggleSubscription, getSubscribedChannels ,getChannelSubscribers};
