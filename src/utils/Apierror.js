class ApiError extends Error{
    constructor(statuscode,message="Something went wrong",errors=[],stack){
        super(); // Must call super constructor in derived class before accessing 'this' or returning from derived constructor
        this.message = message,
        this.statuscode = statuscode
        this.errors = errors
        this.stack = stack
        this.success = false

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export {ApiError}