import app from './app.js';
import dotenv from 'dotenv'
import connectDB  from './config/db.js';


// Load environment variables from .env file
dotenv.config()
// Connect to the database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});    