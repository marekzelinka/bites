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
import { checkRestaurantExists, validate } from "../utils/middleware.js";
import { getCurrentRedisClient } from "../utils/redis.js";
import { errorResponse, successResponse } from "../utils/responses.js";

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
    checkRestaurantExists,
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
  .get("/:restaurantId", checkRestaurantExists, async (req, res) => {
    const redisClient = await getCurrentRedisClient();

    const restaurantId = req.params.restaurantId as string;
    const restaurantKey = restaurantKeyById(restaurantId);

    const [_viewCount, restaurant] = await Promise.all([
      redisClient.hIncrBy(restaurantKey, "viewCount", 1),
      redisClient.hGetAll(restaurantKey),
    ]);

    successResponse({ res, data: restaurant });
  })
  .get("/:restaurantId/reviews", checkRestaurantExists, async (req, res) => {
    const redisClient = await getCurrentRedisClient();

    const restaurantId = req.params.restaurantId as string;
    const reviewKey = reviewKeyById(restaurantId);

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;
    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const reviewIds = await redisClient.lRange(reviewKey, start, end);
    const reviews = await Promise.all(
      reviewIds.map((id) => {
        const reviewDetailsKey = reviewDetailsKeyById(id);
        return redisClient.hGetAll(reviewDetailsKey);
      }),
    );

    successResponse({ res, data: reviews });
  })
  .delete(
    "/:restaurantId/reviews/:reviewId",
    checkRestaurantExists,
    async (req, res) => {
      const redisClient = await getCurrentRedisClient();

      const restaurantId = req.params.restaurantId as string;
      const reviewKey = reviewKeyById(restaurantId);

      const reviewId = req.params.reviewId;
      if (!reviewId) {
        errorResponse({
          res,
          status: 404,
          error: "Review ID not found",
        });
        return;
      }

      const reviewDetailsKey = reviewDetailsKeyById(reviewId);

      const [removeResult, deleteResult] = await Promise.all([
        redisClient.lRem(reviewKey, 0, reviewId),
        redisClient.del(reviewDetailsKey),
      ]);
      const isDeleted = removeResult !== 0 && deleteResult !== 0;
      if (!isDeleted) {
        errorResponse({ res, status: 404, error: "Review not found" });
        return;
      }

      successResponse({ res, data: { reviewId }, message: "Review deleted" });
    },
  );
