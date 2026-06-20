enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400, // For validation error
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(HttpStatus.BAD_REQUEST, message, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(HttpStatus.FORBIDDEN, message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      HttpStatus.NOT_FOUND,
      id ? `${resource} with id ${id} not found` : `${resource} not found`
    );
    this.name = "NotFoundError";
  }
}

export class RequestValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, message, details);
    this.name = "RequestValidationError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal server error") {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
    this.name = "InternalServerError";
  }
}
