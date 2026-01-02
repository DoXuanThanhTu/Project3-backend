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
      user: data.user,
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
      user: data.user,
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
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie("refreshToken", {
        path: "/api/auth",
      });

      return res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Logout failed" });
    }
  }

  private static setRefreshCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/api/auth",
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
