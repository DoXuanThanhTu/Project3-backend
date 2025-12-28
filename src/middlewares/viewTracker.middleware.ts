// middlewares/viewTracker.middleware.ts
import { Request, Response, NextFunction } from "express";
import viewCounterService from "../modules/viewCounter/viewCounter.service";

export const trackViewMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Chỉ track các request GET đến movie/episode
    if (req.method === "GET") {
      const { movieId, episodeId } = req.params;

      if (movieId) {
        // Tạo sessionId từ IP + User-Agent
        const sessionId = `${req.ip}-${req.get("User-Agent")}`;

        // Gọi service để tăng view (async, không cần await)
        viewCounterService
          .incrementView(movieId, episodeId, sessionId, {
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          })
          .catch((err) => console.error("Error tracking view:", err));
      }
    }

    next();
  } catch (error) {
    console.error("Error in trackViewMiddleware:", error);
    next();
  }
};
