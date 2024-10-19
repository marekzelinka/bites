function getKeyName(...args: string[]) {
  return `bites:${args.join(":")}`;
}

export function getRestaurantKeyById(id: string) {
  return getKeyName("restaurants", id);
}

export function getReviewKeyById(id: string) {
  return getKeyName("reviews", id);
}

export function getReviewDetailsKeyById(id: string) {
  return getKeyName("review_details", id);
}
