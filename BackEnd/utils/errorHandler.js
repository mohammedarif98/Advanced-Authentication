

//!----------------------  error handling middleware for undefined routes ----------------------
import globalErrorHandler from "../controllers/errorController.js"


// class AppError extends Error {
//     constructor( message,statusCode ){
//         super( message );
//         this.statusCode = statusCode
//         this.status = `${ statusCode }`.startsWith("4") ? "fail" : "error";
//         Error.captureStackTrace( this,this.constructor );
//     }
// }

export function customErrorHandler(message, statusCode){
  const error = new Error(message);                                             // Create an error object with the message
  error.statusCode = statusCode;                                                // Attach additional properties to the error object
  error.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
  Error.captureStackTrace(error, globalErrorHandler);                                     // Capture the stack trace
  return error;                                                                 // Return the customized error object
}


