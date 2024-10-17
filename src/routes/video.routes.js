import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { publishAVideo, updateVideo,deleteVideo,watchVideoById } from "../controllers/video.controller.js";
import { verifyJWTToken } from "../middlewares/auth.middleware.js";
const VideoRoute = Router();

VideoRoute.route('/upload').post(verifyJWTToken, upload.single('video-file'),publishAVideo );
VideoRoute.route('/update/:videoId').post(verifyJWTToken, upload.single('video-file'),updateVideo );
VideoRoute.route('/delete/:videoId').post(verifyJWTToken,deleteVideo );
VideoRoute.route('/watch/:videoId').post(verifyJWTToken,watchVideoById );

export {VideoRoute};