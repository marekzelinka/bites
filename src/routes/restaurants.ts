import express from "express";
import { nanoid } from "nanoid";
import { RestaurantSchema, type Restaurant } from "../schemas/restaurant.js";
import { restaurantKeyById } from "../utils/keys.js";
import { logInfo } from "../utils/logger.js";
import { validate } from "../utils/middleware.js";
import { initRedisClient } from "../utils/redis.js";
import { successResponse } from "../utils/responses.js";

export const restaurantsRouter = express
  .Router()
  .get("/", async (_req, res) => {
    res.send("Hello from restaurantsRouter");
  })
  .post("/", validate(RestaurantSchema), async (req, res) => {
    const data = req.body as Restaurant;

    const redis = await initRedisClient();

    const id = nanoid();
    const restaurantKey = restaurantKeyById(id);
    const hashData = { id, name: data.name, location: data.location };
    const addResult = await redis.hSet(restaurantKey, hashData);
    logInfo(`Added ${addResult} fields`);

    successResponse({ res, data: hashData, message: "Added new restaurant" });
  });
