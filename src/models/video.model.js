import mongoose, { Schema, Scheme } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const videoSchema = new Scheme({
    videoFile:{
        type: String, //cloudinary url
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    
    duration:{
        type: Number, //from cloudinary url
        required: true
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User" 
    }
}, { timestamps: true });
//this helps in writing aggregation function insdie mongodb
videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)
