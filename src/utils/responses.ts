import type { Response } from "express";

export function successResponse(
  response: Response,
  data: any,
  message = "Success",
) {
  return response.status(200).json({ success: true, message, data });
}

export function errorResponse(
  response: Response,
  status: number,
  error: string,
) {
  return response.status(status).json({ success: false, error });
}
