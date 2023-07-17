export enum ErrorMessage {
    BadRequest = `Bad Request. HTTP request that was sent to the server has invalid syntax.`,
    BadRequestMissingDate = `Bad Request. Parameter [date] not found.`,
    BadRequestMissingFromOrTo = `Bad Request. Parameters [from or to] not found.`,
    BadRequestMissingId = `Bad Request. Parameter [id] not found.`,
    BadRequestMissingVersionCode = `Bad Request. Parameter [versionCode] or [platform] not found.`,
    Unauthorized = "Unauthorized. User has not been authenticated."
}