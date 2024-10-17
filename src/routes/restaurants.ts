import express from "express";
import { RestaurantSchema, type Restaurant } from "../schemas/restaurant.js";
import { validate } from "../utils/middleware.js";
import { initRedisClient } from "../utils/redis.js";

export const restaurantsRouter = express
  .Router()
  .get("/", async (_req, res) => {
    res.send("Hello from restaurantsRouter");
  })
  .post("/", validate(RestaurantSchema), async (req, res) => {
    const data = req.body as Restaurant;
    await initRedisClient();
    res.send("Hello world");
  });
