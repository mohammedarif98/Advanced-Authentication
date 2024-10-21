
import express from "express"
const router = express.Router()
import { forgotPassword, login, logout, resendOTP, resetPassword, signUp, verifyUserAccount } from "../controllers/authController.js"
import { isAuthenticated, refreshAccessToken } from "../middleware/isAuthenticated.js";
import { catchAsync } from "../utils/catchAsync.js";


router.post("/signup", signUp);
router.post('/verify', verifyUserAccount)
router.post('/resent-otp',isAuthenticated, resendOTP)
router.post('/login',login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);




router.get('/protected', isAuthenticated, catchAsync(async (req, res) => {
    res.status(200).json({status: 'success',data: { username: req.user.username,email: req.user.email,message: 'You have accessed a protected route!'}});
}));

//--------------- Route for refreshing access token ----------------
router.post("/refresh-token", refreshAccessToken); 



export default router