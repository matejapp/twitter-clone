import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {

    try {
        const userId = req.user._id.toString();

        const notifications = await Notification.find({to: userId}).sort({createdAt: -1}).populate({path: "from", select: "username profileImg"});

        await notifications.updateMany({to: userId}, {read: true});

        res.status(200).json(notifications);
    } catch (error) {
        console.log("error", error);
        res.status(500).json("Error getting notifications",{error: error.message});
    }
};

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        await Notification.deleteMany({to: userId});

        res.status(200).json({message: "Notifications deleted"});
    } catch (error) {
        console.log("error", error);
        res.status(500).json("Error deleting notifications",{error: error.message});
    }
};