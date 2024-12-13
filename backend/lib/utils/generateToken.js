import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId,res) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET,
        {expiresIn:"15d"}
    );
    res.cookie("jwt",token,{
        maxAge: 15 * 24 * 60 * 60 * 1000,//ms
        httpOnly: true,//only server can access the cookie
        sameSite: "strict",//cookie can only be sent to the same site
        secure: process.env.NODE_ENV === "production",//cookie can only be sent over HTTPS
    });

    return token;
}