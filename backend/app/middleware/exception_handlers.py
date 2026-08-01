from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder
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
        raw_errors = exc.errors()
        message = "Input validation failed. Please check field requirements."

        if raw_errors:
            pwd_err = next(
                (e for e in raw_errors if "password" in [str(x).lower() for x in e.get("loc", ())] or "Password must contain" in e.get("msg", "")),
                None
            )
            if pwd_err:
                message = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
            else:
                first_err = raw_errors[0]
                err_msg = first_err.get("msg", "")
                if err_msg.startswith("Value error, "):
                    err_msg = err_msg[len("Value error, "):]
                loc_str = str(first_err.get("loc", ())).lower()

                if "email" in loc_str:
                    message = "Please enter a valid email address."
                elif "role" in loc_str:
                    message = f"Invalid role specified: '{first_err.get('input', '')}'. Allowed: patient, doctor, researcher, admin"
                elif err_msg:
                    message = err_msg

        sanitized_details = jsonable_encoder(raw_errors)

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": message,
                "error": {
                    "code": 422,
                    "message": message,
                    "details": sanitized_details,
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
