import jwt from "jsonwebtoken";

// Sign a new access token
const signAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

// Sign a new refresh token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};


// send token to signuping
const createSendToken = (user, statusCode, res, message) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only secure in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("refreshToken", refreshToken, cookieOptions); // Set refresh token in cookie

  // Hide sensitive data
  user.password = undefined;
  user.otp = undefined;
  user.confirmPassword = undefined;

  const { username, email, _id } = user;          // Destructure non-sensitive user info

  return res.status(statusCode).json({
    status: "success",
    message,
    accessToken,
    refreshToken,
    userData: { username, email, _id },
  });
};



export { createSendToken, signAccessToken, signRefreshToken };
