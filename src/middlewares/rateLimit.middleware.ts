import rateLimit from "express-rate-limit";

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // 10 request / IP
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many attempts, please try again later",
    },
  },
});

export const globalRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});
