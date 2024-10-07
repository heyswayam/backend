import { type } from 'express/lib/response';
import mongoose, { Schema } from 'mongoose';
import bcrypt, { compare, hash } from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
            type: String, //cloudinary url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
        password: {
            type: String,
            required: [True, 'Password is required'],
        },
    },
    {
        timestamps: true 
    }
);

//bcrypt helps in hashing the password

// here not using arrow function, since it doesn't have access to 'this' keyword
userSchema.pre('save', async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(myPlaintextPassword, saltRounds);
    }
    return next();
  });

  // user defined custom method to check if password matches

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password) //returns boolean
}
export const User = mongoose.model("User",userSchema)