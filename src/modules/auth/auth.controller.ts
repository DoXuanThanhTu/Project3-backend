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

  // ===== CHANGE PASSWORD =====
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ message: "Không xác thực được người dùng" });
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: "Vui lòng cung cấp mật khẩu cũ và mật khẩu mới",
        });
      }

      const result = await AuthService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Change password error:", error);

      if (
        error.name === "BadRequestError" ||
        error.name === "UnauthorizedError"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Đổi mật khẩu thất bại. Vui lòng thử lại sau.",
        error,
      });
    }
  }

  private static setRefreshCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
