import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
const verifyJWTToken = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) throw new ApiError(500, 'wrong access token or User is not logged in');

        const data = await jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(data._id).select(
            '-password -refreshToken'
        );

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Error getting access token');
    }
});

export { verifyJWTToken };
