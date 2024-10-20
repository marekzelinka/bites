import express from "express";
import { cuisinesRouter } from "./routes/cuisines.js";
import { restaurantsRouter } from "./routes/restaurants.js";
import "./utils/env.js";
import { logInfo } from "./utils/logger.js";
import { errorHandler } from "./utils/middleware.js";

express()
  .use(express.json())
  .use("/api/restaurants", restaurantsRouter)
  .use("/api/cuisines", cuisinesRouter)
  // errorHandler should be the last loaded middleware
  .use(errorHandler)
  .listen(process.env.PORT, () =>
    logInfo("Application running on port", process.env.PORT),
  )
  .on("error", (err) => {
    throw new Error(err.message);
  });
