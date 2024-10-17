import { catchAsync } from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import { generateOTP } from '../utils/generateOTP.js';
import { customErrorHandler } from '../utils/errorHandler.js'
import { createSendToken, } from '../utils/jwt.js';
import { sendEmail } from '../utils/sendEmail.js';




//* ------------------- user registration ------------------------
export const signUp = catchAsync(async (req, res, next) => {

    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) return next(new customErrorHandler("Passwords do not match", 400));

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new customErrorHandler("Email is already registered", 400));

    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires after 5 minutes 

    const newUser = new User({
        username,
        email,
        password,
        otp,
        otpExpires, 
    });

    newUser.confirmPassword = confirmPassword;            // Set confirmPassword for validation, but it won't be saved

    try {
        await sendEmail({ 
            email: newUser.email,
            subject: "OTP for email verification",
            html: `<h1>Your OTP is: ${otp}</h1>`,
        });

        await newUser.save();              // Save user to the database
        createSendToken(newUser, 200, res, "Registration Successful");
        console.log(`OTP : ${otp}`);
        console.log("user created successfully");

    } catch (error) {
        console.log("error in registration ",error);
        await User.findByIdAndDelete(newUser._id);
        return next(new customErrorHandler("There was an error sending the email. Try again", 500));
    }
});


//* ------------------- verify account using OTP ------------------------
export const verifyUserAccount = catchAsync(async (req,res,next) => {
    const { otp } =  req.body;

    if (!otp) return next(new customErrorHandler("OTP is missing!", 400));
    
    const userId = req.user;  // userId is obtained from the authenticated request (req.user, set by protect middleware)

    const user = await User.findById(userId);
    if (!user) return next(new customErrorHandler("User not found", 404));

    const isOtpValid = otp === user.otp && Date.now() < user.otpExpires;
    if (!isOtpValid) return next(new customErrorHandler("Invalid or expired OTP", 400));

    user.isVerified = true;             // Ensure you add this field in your User model
    user.otp = null;                    // Clear OTP after successful verification
    user.otpExpires = null;
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res, "Email has been verified successfully");    // Send response with a new token
})



//* ------------------- resend OTP ------------------------
export const  resendOTP = catchAsync(async(req, res, next) => {

    const { email } = req.user;
    if( !email ) return next(new customErrorHandler("Email is required for resend otp",400)); 

    const user = await User.findOne({ email });
    if( !user ) return next(new customErrorHandler("user not found",404)); 

    if( user.isVerified ) return next(new customErrorHandler("user is Already verified ",400));

    const newOTP = generateOTP();
    user.otp = newOTP;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires after 5 minutes
    
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail({
            email: user.email,
            subject: "Resend OTP for email verification",
            html: `<h1>Your new OTP is: ${newOTP}</h1>`,
        });

        res.status(200).json({
            status: "success",
            message: "OTP has been resent to your email",
        });

        console.log(`Resent OTP : ${newOTP}`);
    } catch (error) {
        user.otp = undefined;                    // Clear OTP after successful verification
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.log("Error in sending OTP email:", error);
        return next(new customErrorHandler("There was an error sending the email. Please try again later.", 500));
    }
});  


//* ------------------- user Login ------------------------
export const login = catchAsync(async(req, res, next) => {

    const { email,password } = req.body;
    if(!email || !password) return next(new customErrorHandler("Please provide email and password ",400));

    const user = await User.findOne({ email }).select('+password');         // Find user by email and select password field for verification
 
    if (!user || !(await user.correctPassword( password, user.password ))) return next(new customErrorHandler("Invalid credentials", 401));
    
    // // compare the req.body password to password in database
    // const isPasswordCorrect = bcrypt.compareSync( password,user.password );
    // if (!isPasswordCorrect) return next(new customErrorHandler("Invalid credentials", 401));

    if (!user.isVerified) return next(new customErrorHandler("Your email has not been verified. Please verify your email first.", 403));
    
    createSendToken(user, 200, res, "Login successful");      // create and send the tokens
})


//* ------------------- user logout ------------------------
export const logout = catchAsync(async(req,res,next) => {
    res.cookie("refreshToken","loggedout",{
        expires: new Date(Date.now() + 10*1000 ),    // Set refresh token cookie to expire in 10 seconds
        httpOnly : true,
        secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ status: "success",message: "logout successfully"})
})


//* ------------------- forgotPassword ------------------------
export const forgotPassword = catchAsync(async(req, res, next) => {

    const { email } = req.body;
    if (!email) return next(new customErrorHandler('Please provide an email address', 400));

    const user = await User.findOne({ email });
    if (!user) return next(new customErrorHandler("No user found with this email", 404));
    
    const otp =  generateOTP();

    user.resetPasswordOTP = otp
    user.resetPasswordOTPExpires = Date.now() + 5 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
        const message = `<h1>Your password reset OTP is: ${otp}</h1>`;
        await sendEmail({
            email: user.email,
            subject: 'Password Reset OTP',
            html: message,
        });

        res.status(200).json({
            status: 'success',
            message: 'password reset OTP sent to your email address',
        });
    } catch (err) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });

        console.log(`Email: ${email}, OTP: ${otp}`);
        console.log(`Expected OTP: ${user.resetPasswordOTP}, Expires: ${user.resetPasswordOTPExpires}`);


        return next(new customErrorHandler('There was an error sending the email. Try again later.', 500));
    }
});


//* ------------------- reset Password ------------------------
export const resetPassword = catchAsync(async(req, res,next) => {

    const { email, password, confirmPassword,otp } = req.body;

    if(!otp || !email || !password || !confirmPassword){
        return next(new customErrorHandler(`${!otp ? 'OTP' : !email ? 'Email' : 'Both password and confirm password'} are required`, 400));
    }
      
    if (password !== confirmPassword) return next(new customErrorHandler('Passwords do not match', 400));
    
    //* ----------- Find the user by OTP and check if the OTP is still valid (not expired) -----------
    // const user = await User.findOne({
    //     resetPasswordOTP: otp,
    //     resetPasswordOTPExpires: { $gt: Date.now() },  // OTP should still be valid (not expired)
    // });

    const user = await User.findOne({
        email,
        resetPasswordOTP: otp,
        resetPasswordOTPExpires: { $gt: Date.now() },  // OTP should still be valid (not expired)
    });
    console.log(user)

    if (!user) return next(new customErrorHandler('User not found or OTP has expired', 400));

    user.password = password;
    // user.confirmPassword = confirmPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    
    await user.save({ validateBeforeSave: false });     // Disable validation to skip the `confirmPassword` check

    createSendToken( user,200,res,"password reset successfull")

});