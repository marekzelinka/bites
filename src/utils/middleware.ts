import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { logError } from "./logger.js";
import { errorResponse } from "./responses.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logError(err);

  errorResponse({ res, status: 500, error: err });
}

export function validate<SchemaOutput>(schema: ZodSchema<SchemaOutput>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, errors: error.errors });
      } else {
        errorResponse({ res, status: 500, error: "Internal Server Error" });
      }
    }
  };
}
