import express from "express";

export const restaurantsRouter = express
  .Router()
  .get("/", async (_request, response) => {
    response.send("Hello from restaurantsRouter");
  });
