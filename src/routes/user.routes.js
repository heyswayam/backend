import { Router } from 'express';
import { registerUser,loginUser,logoutUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWTToken } from '../middlewares/auth.middleware.js';

const UserRoute = Router();
//this middleware just add another object (i.e. here 'files' check documentation) to the req object
UserRoute.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
    ]),
    registerUser
);

UserRoute.route('/login').post(loginUser)
//middleware ko reference do, execute mat kro (vid:16, 55:10)
UserRoute.route('/logout').post(verifyJWTToken,logoutUser)
export {UserRoute};
