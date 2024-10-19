import express from "express";
import { nanoid } from "nanoid";
import { RestaurantSchema, type Restaurant } from "../schemas/restaurant.js";
import { ReviewSchema, type Review } from "../schemas/review.js";
import {
  restaurantKeyById,
  reviewDetailsKeyById,
  reviewKeyById,
} from "../utils/keys.js";
import { logInfo } from "../utils/logger.js";
import { checkRestaurantIdExists, validate } from "../utils/middleware.js";
import { getCurrentRedisClient } from "../utils/redis.js";
import { successResponse } from "../utils/responses.js";

export const restaurantsRouter = express
  .Router()
  .post("/", validate(RestaurantSchema), async (req, res) => {
    const redisClient = await getCurrentRedisClient();

    const id = nanoid();
    const restaurantKey = restaurantKeyById(id);
    const restaurant = req.body as Restaurant;
    const hashData = {
      id,
      name: restaurant.name,
      location: restaurant.location,
    };

    const addResult = await redisClient.hSet(restaurantKey, hashData);

    logInfo(`Added ${addResult} fields`);

    successResponse({ res, data: hashData, message: "Added new restaurant" });
  })
  .post(
    "/:restaurantId/reviews",
    checkRestaurantIdExists,
    validate(ReviewSchema),
    async (req, res) => {
      const redisClient = await getCurrentRedisClient();

      const restaurantId = req.params.restaurantId as string;
      const reviewKey = reviewKeyById(restaurantId);
      const reviewId = nanoid();
      const reviewDetailsKey = reviewDetailsKeyById(reviewId);
      const reviewData = req.body as Review;
      const hashData = {
        id: reviewId,
        restaurantId,
        ...reviewData,
        timestamp: Date.now(),
      };

      await Promise.all([
        redisClient.lPush(reviewKey, reviewId),
        redisClient.hSet(reviewDetailsKey, hashData),
      ]);

      successResponse({ res, data: hashData, message: "Review added" });
    },
  )
  .get("/:restaurantId", checkRestaurantIdExists, async (req, res) => {
    const redisClient = await getCurrentRedisClient();

    const restaurantId = req.params.restaurantId as string;
    const restaurantKey = restaurantKeyById(restaurantId);

    const [_viewCount, restaurant] = await Promise.all([
      redisClient.hIncrBy(restaurantKey, "viewCount", 1),
      redisClient.hGetAll(restaurantKey),
    ]);

    successResponse({ res, data: restaurant });
  });
