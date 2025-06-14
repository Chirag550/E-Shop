export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}
//not found error

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

//validation Error( use for joi/Zod/react-hook-form validations errors)
export class validationError extends AppError {
  constructor(message = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

//Authentication error
export class AuthError extends AppError {
  constructor(message = "unauthorizes") {
    super(message, 401);
  }
}

//Forbidden Error (for insufficient persmission)
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

//mongodb error(Database erorr)
export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

//Rate limit Error (is user exceeds Appi limits)

export class RateLimitError extends AppError {
  constructor(message = "Too many requests, Please try again later ") {
    super(message, 429);
  }
}
