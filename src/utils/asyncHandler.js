/*
higher order function : the functions that can accept functions in parameter and returns another function

The req, res, and next arguments are provided by the Express.js framework when it calls the middleware function. Here's a step-by-step explanation:

Express Middleware: In an Express application, middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.

Async Handler: The asyncHandler function is a higher-order function that takes an asynchronous function fn as an argument and returns a new middleware function.

Middleware Execution: When a request is made to the server, Express will call the middleware function and pass req, res, and next as arguments.

Error Handling: Inside the returned middleware function, fn is called with req, res, and next. If fn throws an error or returns a rejected promise, the catch block will handle it and send an error response. 

const asyncHandler = (fn) => {}
const asyncHandler = (fn) => { ()=> {} }
const asyncHandler = (fn) => { async()=> {} }
const asyncHandler = (fn) => async()=> {} 
*/
////////// then catch method
// const asyncHandler = (reqHandler)=> async (req,res,next)=>{
//     Promise.resolve(reqHandler(req,res,next)).catch((err)=>next(err))
// }
const asyncHandler = (fn) => {
    async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            res.status(err.code || 500).json({
                success: false,
                message: err.message,
            });
        }
    };
};

const handler = (fn)=> async(req,res,next)=>{
    try{
        await fn(req,res,res);
    }
    catch(err){
        res.status(err.code || 500).json({
            success: false,
            message: err.message,
        })
    }
}
export {asyncHandler};