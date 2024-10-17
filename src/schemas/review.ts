import { z } from "zod";

export type Review = z.infer<typeof ReviewSchema>;
export const ReviewSchema = z.object({
  review: z.string().min(1),
  rating: z.number().min(1).max(5),
});
