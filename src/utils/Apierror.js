import { constructor } from "cookie-parser"


class ApiError extends Error{
    constructor(statuscode,message="Something went wrong",errors=[],stack){

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