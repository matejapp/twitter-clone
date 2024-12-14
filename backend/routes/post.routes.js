import express from "express";
import {
    protectRoute
} from "../middleware/protectRoute.js";
import {
    commentOnPost,
    createPost,
    deletePost,
    likeUnlikePost,
    getAllPosts,
    getLikedPosts,
    getFollowingPosts,
    getUsersPosts
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/getAllPosts", protectRoute, getAllPosts);
router.get("/userPosts/:username", protectRoute, getUsersPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id",protectRoute,likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;