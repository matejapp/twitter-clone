import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import {v2 as cloudinary} from "cloudinary";

export const createPost = async (req,res) =>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(!text && !img){
            return res.status(400).json({error: "Please provide text or image"});
        }

        if(img){
            const uploadedResponse = cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;  
        }

        const newPost = new Post({
            user:userId,
            text,
            img
        })

        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        console.log("error", error);
        res.status(500).json("Error creating post",{error: error.message});
    }
};

export const deletePost = async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "Unauthorized"});
        }

        if(post.img){
            cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({message: "Post deleted"});
    } catch (error) {
        res.status(500).json("Error deleting post",{error: error.message});
        console.log("error", error);
    }
};

export const commentOnPost = async (req,res) =>{
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(!text){
            return res.status(400).json({error: "Please provide text"});
        }

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        const comment = {user:userId,text:text};
        post.comments.push(comment);

        await post.save();
        res.status(200).json(post);
        
    } catch (error) {
        res.status(500).json("Error commenting on post",{error: error.message});
        console.log("error", error);
    }
};

export const likeUnlikePost = async (req,res) =>{
    try {
        const postId = req.params.id;
        const userId = req.user._id.toString();

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(post.likes.includes(userId)){
            await Post.findByIdAndUpdate(postId,{$pull:{likes: userId}});
            await User.findByIdAndUpdate(userId,{$pull:{likedPosts: postId}})
            res.status(200).json({message: "Post unliked"});
        }else{
            await Post.findByIdAndUpdate(postId,{$push:{likes: userId}});
            await User.findByIdAndUpdate(userId,{$push:{likedPosts: postId}});
            res.status(200).json({message: "Post liked"});
            //send notification
            const newNotification = new Notification({
                from: userId,
                to: post.user,
                type: "like",
                postId
            });
            await newNotification.save();
        }
    } catch (error) {
        res.status(500).json("Error liking/unliking post",{error: error.message});
        console.log("error", error);
    }
};

export const getAllPosts = async (req,res) =>{
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        }).populate({  
            path: "comments.user",
            select: "-password",})

        if(posts.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log("error", error);
        res.status(500).json("Error getting posts",{error: error.message});
    }
};

export const getLikedPosts = async (req,res) =>{
    const userId = req.params.id;

    try {
       const user = await User.findById(userId);

       if(!user){
           return res.status(404).json({error: "User not found"});
       } 

       const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
           path: "user",
           select: "-password",
       }).populate({
           path: "comments.user",
           select: "-password",
       })

       res.status(200).json(likedPosts);
    } catch (error) {
        console.log("error", error);
        res.status(500).json("Error getting liked posts",{error: error.message});
    }
};

export const getFollowingPosts = async (req,res) =>{
    try {
        const userId = req.user._id.toString();
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        const followingPosts = await Post.find({user: {$in: user.following}}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        })

        res.status(200).json(followingPosts);
    } catch (error) {
        console.log("error", error);   
        res.status(500).json("Error getting following posts",{error: error.message});
    }
};

export const getUsersPosts = async (req,res) =>{
    try {
        const username = req.params.username;
        const user = await User.findOne({username});

        if(!user){
            return res.status(404).json({error: "User not found"});
        };

        const usersPosts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        })

        res.status(200).json(usersPosts);
    } catch (error) {
        console.log("error", error);
        res.status(500).json("Error getting users posts",{error: error.message});
    }
};