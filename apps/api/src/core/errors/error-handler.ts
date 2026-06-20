import Elysia from "elysia";
import { AppError } from "./error-types";

export const errorHandler = new Elysia().onError(({ code, error, set }) => {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return {
      success: false,
      error: error.name,
      message: error.message,
      details: error.details
    };
  }

  if (code === "NOT_FOUND") {
    set.status = 404;
    return {
      success: false,
      error: "NotFoundError",
      message: "Route not found"
    };
  }

  if (code === "VALIDATION") {
    set.status = 422;
    return {
      success: false,
      error: "RequestValidationError",
      message: "Invalid request payload",
      details: error.all
    };
  }

  set.status = 500;
  return {
    success: false,
    error: "InternalServerError",
    message: "Something went wrong"
  };
});
