// express doesn't gives any classes to handle error yet, so neet to define this things by ourselves
class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400
    }
}

export { ApiResponse }