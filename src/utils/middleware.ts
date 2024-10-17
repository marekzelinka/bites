import type { NextFunction, Request, Response } from "express";
import { logError } from "./logger.js";
import { errorResponse } from "./responses.js";

export function errorHandler(
  error: any,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  logError(error);

  errorResponse(response, 500, error);
}
