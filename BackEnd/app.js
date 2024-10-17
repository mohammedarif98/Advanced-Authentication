import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
import { customErrorHandler } from "./utils/errorHandler.js";
import globalErrorHandler from './controllers/errorController.js'
import authRouter from "./routes/authRoutes.js"

const app = express();


app.use(cookieParser());

app.use(
    cors({
        origin: ['http://localhost:3000'],
        // origin: '*', // Allow requests from any origin
        credentials: true,
        })
    );

// Middleware to parse JSON requests with a limit
app.use(express.json({ limit: "15kb" }));  

// pre defined router
app.use('/api/auth',authRouter)

// Catch all for undefined routes
app.all("*", ( req,res,next ) => {
    next(new customErrorHandler( `Cant find ${req.originalUrl} on this server`,404 ))
});

// global error handler middleware
app.use(globalErrorHandler);

export default app;