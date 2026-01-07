import { HttpStatus } from "../enums";

class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(HttpStatus.NOT_FOUND, message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message);
  }
}

class InternalServerError extends AppError {
  constructor(message: string) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  InternalServerError,
};
