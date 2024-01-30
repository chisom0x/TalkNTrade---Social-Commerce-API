function sendErrorResponse(res, statusCode, message) {
    return res.status(statusCode).json({
        status: 'failed',
        message: message,
    });
}

module.exports = sendErrorResponse;
