import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async  (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error: "Not authorized"});
        };
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(!decoded){
            return res.status(401).json({error: "Not authorized"});
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(401).json({error: "Not authorized"});
        };

        req.user = user;
        next();
    } catch (error) {
        console.log("error", error);
        res.status(500).json("Error loging in user",{error: error.message});
    }
}