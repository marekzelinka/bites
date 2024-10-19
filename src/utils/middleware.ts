import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { restaurantKeyById } from "./keys.js";
import { logError } from "./logger.js";
import { getCurrentRedisClient } from "./redis.js";
import { errorResponse } from "./responses.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  logError(err);

  errorResponse({ res, status: 400, error: err });
}

export function validate<SchemaOutput>(schema: ZodSchema<SchemaOutput>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).send({ success: false, errors: error.errors });
      } else {
        errorResponse({ res, status: 500, error: "Internal Server Error" });
      }
    }
  };
}

export async function checkRestaurantIdExists(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const restaurantId = req.params.restaurantId;

  if (!restaurantId) {
    errorResponse({
      res,
      status: 400,
      error: "Restaurant ID not found",
    });
    return;
  }

  const redisClient = await getCurrentRedisClient();

  const restaurantKey = restaurantKeyById(restaurantId);
  const keysCount = await redisClient.exists(restaurantKey);
  const isExistingKey = keysCount !== 0;

  if (!isExistingKey) {
    errorResponse({ res, status: 404, error: "Restaurant not found" });
    return;
  }

  next();
}
