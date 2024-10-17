import { z } from "zod";

export type Restaurant = z.infer<typeof RestaurantSchema>;
export const RestaurantSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  cuisines: z.array(z.string().min(1)),
});

export type RestaurantDetails = z.infer<typeof RestaurantDetailsSchema>;
export const RestaurantDetailsSchema = z.object({
  links: z.array(
    z.object({
      name: z.string().min(1),
      url: z.string().url(),
    }),
  ),
  contact: z.object({
    phone: z.string().min(1),
    email: z.string().email(),
  }),
});
