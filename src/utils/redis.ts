import { createClient, type RedisClientType } from "redis";
import { logError, logInfo } from "./logger.js";

let redis: RedisClientType | null = null;

export async function getCurrentRedisClient() {
  if (!redis) {
    redis = createClient();

    redis.on("error", (err) => logError("Redis Client Error", err));
    redis.on("ready", () => logInfo("Redis Client Started"));

    await redis.connect();
  }

  return redis;
}
