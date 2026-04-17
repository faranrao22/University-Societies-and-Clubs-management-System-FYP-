/** Central query keys so admin screens share cache and invalidations stay consistent. */

export const adminKeys = {
  root: ["admin"],
  stats: () => ["admin", "stats"],
  users: () => ["admin", "users"],
  societiesAll: () => ["admin", "societies", "all"],
  society: (id) => ["admin", "society", id],
  societyEvents: (id) => ["admin", "society", id, "events"],
  events: () => ["admin", "events"],
  event: (id) => ["admin", "event", id],
  elections: () => ["admin", "elections"],
  election: (id) => ["admin", "election", id],
  user: (id) => ["admin", "user", id],
};
