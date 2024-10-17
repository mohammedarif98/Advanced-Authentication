import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: [true,"please provide username"], 
        index: true 
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true,"please provide email"],
        lowercase: true,
        validate: [validator.isEmail,"please provide a valid email"]
    },
    password: {
        type: String,
        required: [true,"please provide password"],
        select: false,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }, 
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    resetPasswordOTP: {
        type: String,
        default: null
    },
    resetPasswordOTPExpires: {
        type: Date,
        default: null
    },
},
{ timestamps: true }
)


// Virtual field for confirmPassword, not saved in the database
userSchema.virtual('confirmPassword')
    .get(function() { return this._confirmPassword; })
    .set(function(value) { this._confirmPassword = value; });

// Pre-validate hook for checking if password and confirmPassword match
userSchema.pre('validate', function(next) {
    if (this.isModified('password') && this.password !== this._confirmPassword) {
        return next(new Error('Passwords do not match'));
    }
    next();
});

// Pre-save hook to hash the password if it's modified
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// password compare for login
userSchema.methods.correctPassword = async function( password, userPassword ){
    return await bcrypt.compare(password,userPassword);
};


const User = mongoose.model("User",userSchema);

export default User;