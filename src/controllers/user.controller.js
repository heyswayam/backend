import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { upoloadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Subscription } from '../models/subscription.model.js';
import { channel, subscribe } from 'diagnostics_channel';
//steps
// get name input
//validate
// check if user aleady exists email and username
// get the localpath of avatarr and coverImage
//upload to coudinary
//make an User object and add to data-base
const generateAccessTokenandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        // prevent the validation check while saving (i.e. password,etc)
        user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            'Some error in generating access and refresh token: ' + error
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // console.log(req.body);
    const { username, fullname, email, password } = req.body;

    if (
        [username, fullname, email, password].map((elem) => {
            if (elem.length === 0) {
                //elem is the value of username,fullname,etc
                throw new ApiError(400, "fields can't be empty");
            }
        })
    ) {
    }

    ///// get local paths for files
    const avatarLocalPath = req.files?.avatar[0].path;
    // console.log(avatarLocalPath);
    if (!avatarLocalPath) throw new ApiError(300, 'Avatar file is required');

    ///// check if user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    // console.log("hello");
    if (existedUser) {
        const fs = await import('fs');
        fs.unlinkSync(avatarLocalPath);
        throw new ApiError(
            409,
            'User already exists with same email or username'
        );
    }

    let coverImageUrl = null;
    if (req.files?.coverImage && req.files.coverImage[0]?.path) {
        coverImageUrl = await upoloadOnCloudinary(req.files.coverImage[0].path);
    }
    const avatarUrl = await upoloadOnCloudinary(avatarLocalPath);

    ///// this User has access to mongoose, so we can communicate with database directly
    const userInstance = await User.create({
        coverImage: coverImageUrl?.url || '',
        username,
        fullname,
        avatar: avatarUrl.secure_url,
        email,
        password,
    });
    const createdUser = await User.findById(userInstance._id).select(
        '-password '
    ); // select the attributes you dont wanna send

    const selfSubcription = await Subscription.create({
        channel:userInstance._id,
        subscriber:userInstance._id,
    })
    return res.status(200).json(new ApiResponse(200, createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
    //get email and password
    //validate if email present
    //compare password
    //if successfull, give access token and refresh token

    // if(req.cookies?.accessToken){
    //     throw new ApiError(400,"User already logged in")
    // }

    const { email, password } = req.body;
    // console.log(email);
    // console.log(password);

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
        throw new ApiError(404, "email doesn't exists");
    }
    //check password
    const response = await existedUser.isPasswordCorrect(password);
    if (!response) throw new ApiError(401, 'password is wrong');
    const { accessToken, refreshToken } =
        await generateAccessTokenandRefreshToken(existedUser._id);
    //the accessToken,refreshToken is saved after existedUser is created, so it's not reflected here. So we make another call to get th updated list
    const loggedInUser = await User.findById(existedUser._id).select(
        '-refreshToken -password'
    );

    const option = {
        //to prevent tampering with cookies at client side
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie('accessToken', accessToken, option)
        .cookie('refreshToken', refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    refreshToken,
                    accessToken,
                },
                'Login successfull'
            )
        );

    // return res.status(200).json(new ApiResponse(200,"successfull"))
});

const logoutUser = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    currentUser.refreshToken = undefined;
    await currentUser.save({ validateBeforeSave: false });
    const options = {
        secure: true,
        httpOnly: true,
    };

    return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

const updateRefreshandAccessToken = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const incomingRefreshToken = req.cookies['refreshToken'];
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh tokens doesn't match");
    }
    //new accessToken and refreshToken is generated
    const { accessToken, refreshToken } =
        await generateAccessTokenandRefreshToken(user._id);
    const option = {
        //to prevent tampering with cookies at client side
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .cookie('accessToken', accessToken, option)
        .cookie('refreshToken', refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                },
                'refreshToken and accessToken refreshed successfully'
            )
        );
});

const getCurrUser = asyncHandler((req,res)=>{
    return res.status(200).json(200,
        {
            user:req.user
        },
        "successfully fetched user details"
    )
})

const changePassword = asyncHandler(async (req,res)=>{
    try {
        const {oldPassword,newPassword} = req.body
        //check if oldPass is correct
        const user = await User.findById(req.user._id)
        const isCorrect = await user.isPasswordCorrect(oldPassword)
        if(!isCorrect) throw new ApiError(401,"Old password do not match");
        // const user = User.findById(req.user._id);
        user.password=newPassword;
        user.save()
    } catch (error) {
        throw new ApiError(400,"Error in changing password: "+error)
    }
    return res.status(200).json(new ApiResponse(200,{},"password changed successfully"))
})

const getUserProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username){
        throw new ApiError(400,"Username is missing from params");
    }
    const channel = await User.aggregate([
        {$match: {
            username: username
        }},
        {$lookup:{
            from:"subscriptions", //foreign table
            as:"subscribers",
            localField:"_id", //local primary key
            foreignField:"channel", //foreign primary key
        }},
        {$lookup:{
            from:"subscriptions",
            as:"subscribedTo",
            localField:"_id",
            foreignField:"subscriber"
        }},
        {$addFields:{
            subscriberCount:{$size: "subscribers"},
            channelSubscribedToCoutn:{$size:"subscribedTo"},
            //skipping isSubscribe to over here, I beleive it's nto required here
        }},
        {$project:{
            fullname:1,
            username:1,
            subscriberCount:1,
            channelSubscribedToCoutn:1,
            avatar:1,
            coverImage:1,
            email:1
        }}
    ])

    if(channel.length==0){
        throw new ApiError(404,"Channel doesn't exists")
    }
    return res.status(200).json(new ApiResponse(200,channel[0],"User details received successfully"))
})

// const getWatchHistory = asyncHandler(async(req,res)=>{
//     const user = User.aggregate([{$match:{_id:req.user._id}},
//         {$lookup:{
//             from:"videos",
//             localField:"watchHistory",
//             foreignField:"_id",
//             as:"watchHistorry"
//         }}
//     ])
// })
export { registerUser, loginUser, logoutUser, updateRefreshandAccessToken,changePassword,getCurrUser };

