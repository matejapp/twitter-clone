import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["follow","like"],
        required: true
    },
    read:{
        type: Boolean,
        default: false
    }
 },{timestamp: true});

 const Notification = mongoose.model("Notification", notificationSchema);
 export default Notification