from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.logging_config import logger


def register_exception_handlers(app: FastAPI):
    """
    Registers global exception handlers to ensure consistent JSON error responses across all APIs.
    """

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.warning(f"HTTPException [{exc.status_code}] path={request.url.path}: {exc.detail}")
        msg = exc.detail if isinstance(exc.detail, str) else "Request processing failed."
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": msg,
                "error": {
                    "code": exc.status_code,
                    "message": msg,
                    "type": "HTTPException",
                },
            },
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"ValidationError path={request.url.path}: {exc.errors()}")
        errors = exc.errors()
        message = "Input validation failed. Please check field requirements."
        if errors:
            first_err = errors[0]
            msg = first_err.get("msg", "")
            if msg.startswith("Value error, "):
                msg = msg[len("Value error, "):]
            loc_str = str(first_err.get("loc", [])).lower()
            err_type = first_err.get("type", "")
            if "email" in loc_str and ("email" in err_type or "value_error" in err_type or "email" in msg.lower()):
                msg = "Please enter a valid email address."
            message = msg

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": message,
                "error": {
                    "code": 422,
                    "message": message,
                    "details": errors,
                    "type": "ValidationError",
                },
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Exception path={request.url.path}: {exc}", exc_info=True)
        message = "Something went wrong. Please try again later."
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": message,
                "error": {
                    "code": 500,
                    "message": message,
                    "type": "InternalServerError",
                },
            },
        )
