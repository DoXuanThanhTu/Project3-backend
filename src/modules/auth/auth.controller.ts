import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    const data = await AuthService.register(
      req.body.email,
      req.body.password,
      AuthController.getMeta(req)
    );

    AuthController.setRefreshCookie(res, data.refreshToken);

    res.status(201).json({
      success: true,
      accessToken: data.accessToken,
    });
  }

  static async login(req: Request, res: Response) {
    const data = await AuthService.login(
      req.body.email,
      req.body.password,
      AuthController.getMeta(req)
    );

    AuthController.setRefreshCookie(res, data.refreshToken);

    res.json({
      success: true,
      accessToken: data.accessToken,
    });
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const data = await AuthService.refresh(refreshToken);

    AuthController.setRefreshCookie(res, data.refreshToken);

    res.json({
      success: true,
      accessToken: data.accessToken,
    });
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    await AuthService.logout(refreshToken);

    res.clearCookie("refreshToken", {
      path: "/api/auth/refresh",
    });

    res.json({ success: true });
  }

  private static setRefreshCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private static getMeta(req: Request) {
    return {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      deviceId: req.headers["x-device-id"] as string,
    };
  }
}
