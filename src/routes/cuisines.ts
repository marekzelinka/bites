import express from "express";
import {
  getCuisineKeyByName,
  getCuisinesKey,
  getRestaurantKeyById,
} from "../utils/keys.js";
import { getCurrentRedisClient } from "../utils/redis.js";
import { successResponse } from "../utils/responses.js";

export const cuisinesRouter = express
  .Router()
  .get("/", async (_req, res) => {
    const redisClient = await getCurrentRedisClient();

    const cuisinesKey = getCuisinesKey();

    const cuisines = await redisClient.sMembers(cuisinesKey);

    successResponse({ res, data: { cuisines } });
  })
  .get("/:cuisine", async (req, res) => {
    const redisClient = await getCurrentRedisClient();

    const cuisine = req.params.cuisine;
    const cuisinesKey = getCuisineKeyByName(cuisine);

    const restaurantIds = await redisClient.sMembers(cuisinesKey);
    const restaurants = await Promise.all(
      restaurantIds.map((id) => {
        const restaurantKey = getRestaurantKeyById(id);

        return redisClient.hGet(restaurantKey, "id");
      }),
    );

    successResponse({ res, data: { restaurants } });
  });
