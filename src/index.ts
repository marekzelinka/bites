import express from "express";
import { cuisinesRouter } from "./routes/cuisines.js";
import { restaurantsRouter } from "./routes/restaurants.js";
import { logInfo } from "./utils/logger.js";
import { errorHandler } from "./utils/middleware.js";

const PORT = process.env.PORT || 3000;

express()
  .use(express.json())
  .use("/restaurants", restaurantsRouter)
  .use("/cuisines", cuisinesRouter)
  // errorHandler should be the last loaded middleware
  .use(errorHandler)
  .listen(PORT, () => logInfo("Application running on port", PORT))
  .on("error", (error) => {
    throw new Error(error.message);
  });
