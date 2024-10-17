import mongoose, { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js';
import { Video } from '../models/video.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { upoloadOnCloudinary } from '../utils/cloudinary.js';


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const videoFileLocalPath = req.file;
    if (!videoFileLocalPath) {
        throw new ApiError(404, 'Video file not received');
    }
    const videoUrl = await upoloadOnCloudinary(videoFileLocalPath.path);

    const videoInstance = await Video.create({
        videoFileUrl: videoUrl.secure_url,
        title: title,
        description: description,
        owner: req.user._id,
        duration: videoUrl.duration,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { videoInstance },
                'Video uploaded successfully'
            )
        );
});

const watchVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
        if (!mongoose.isValidObjectId(videoId)) {
        return res.status(400).json({ error: 'Invalid video ID' });
    }
    //TODO: get video by id and add to watch history
    if(!videoId){
        throw new ApiError(400,"Video ID is required");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $push:{watchHistory: videoId}
    },
    { new: true })
    const videoInstance = await Video.findById(videoId);
    return res
        .status(200)
        .json(new ApiResponse(200, { videoInstance }, "Got video successfully and added to user's watchHistory"));
});

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!mongoose.isValidObjectId(videoId)) {
            return res.status(400).json({ error: 'Invalid video ID' });
        }
        const videoTemp = await Video.findById(videoId);
        if(req.user._id!=videoTemp.owner){
            throw new ApiError(400,"Only the owner can update the video")
        }
        const videoFileLocalPath = req.file;
        if (!videoFileLocalPath) {
            throw new ApiError(404, 'Video file not received');
        }
        const videoUrl = await upoloadOnCloudinary(videoFileLocalPath.path);

        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    videoFileUrl: videoUrl.secure_url,
                },
            },
            { new: true }
        );
        return res
            .status(200)
            .json(
                new ApiResponse(200, { video }, 'Video uploaded successfully')
            );
    } catch (error) {
        throw new ApiError('error while updating video' + error);
    }

    //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findByIdAndDelete(videoId);
    if(req.user._id!=video.owner){
        throw new ApiError(400,"Only the owner can delete the video")
    }
    return res
            .status(200)
            .json(
                new ApiResponse(200, { video }, 'Video deleted successfully')
            );
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export { publishAVideo, updateVideo,deleteVideo,watchVideoById };
