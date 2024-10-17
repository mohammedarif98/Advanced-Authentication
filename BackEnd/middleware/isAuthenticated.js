import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import User from "../models/userModel.js";
import { customErrorHandler } from "../utils/errorHandler.js";
import { signAccessToken } from "../utils/jwt.js";



// Middleware for access token verification
export const isAuthenticated = catchAsync(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) return next(new customErrorHandler("You are not logged in! Please log in to get access.", 401));

    try{
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) return next(new customErrorHandlerErrorHandler("User not found", 403));
        req.user = currentUser;
        next();
    }catch(error){
        return next(new customErrorHandler("Token is invalid or has expired", 403));
    }
});


// Middleware for refresh token verification and generating a new access token
export const refreshAccessToken = catchAsync(async (req, res, next) => {
    
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return next(new customErrorHandler("Refresh token is missing", 403));
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
      
      const user = await User.findById(decoded.id);                                   // Check if user still exists
      if (!user) return next(new customErrorHandler("User not found", 403));
  
      const newAccessToken = signAccessToken(user._id);                           // Generate a new access token
  
      return res.status(200).json({
        status: "success",
        accessToken: newAccessToken,
      });
    } catch (err) {
      return next(new customErrorHandler("Refresh token is invalid or has expired", 403));
    }
  });

