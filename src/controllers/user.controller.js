import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { upoloadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
//steps
// get name input
//validate
// check if user aleady exists email and username
//create user

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
    )
        console.log(req.body);

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(
            409,
            'User already exists with same email or username'
        );
    }

    const avatarLocalPath = req.files?.avatar[0].path;
    console.log(avatarLocalPath);

    let coverImageUrl = null;
    if (req.files?.coverImage && req.files.coverImage[0]?.path) {
        coverImageUrl = await upoloadOnCloudinary(req.files.coverImage[0].path);
    }

    if (!avatarLocalPath) throw new ApiError(300, 'Avatar file is required');

    const avatarUrl = await upoloadOnCloudinary(avatarLocalPath);


    //this User has access to mongoose, so we can communicate with database directly
    const userInstance = await User.create({
        coverImage: coverImageUrl?.url || "",
        username,
        fullname,
        avatar:avatarUrl.url,
        coverImage:coverImageUrl?.url || "",
        // avatar: avatarLocalPath,
        // coverImage: coverImageLocalPath,
        email,
        password,
    });
    const createdUser = await User.findById(userInstance._id).select("-password ") // select the attributes you dont wanna send
    return res.status(200).json(new ApiResponse(200,createdUser));
});

export { registerUser };
