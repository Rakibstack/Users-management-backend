import type { Request, Response } from "express";
import { authService } from "./auth.service";

const logginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.logginUserIntoDB(req.body);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "lax", // Adjust as needed (e.g., "strict" or "none")
    });

    res.status(200).json({
      success: true,
      message: "user logged in successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const refreshToken = async (req: Request, res: Response) => {
  try {
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken,
    );
    res.status(200).json({
      success: true,
      message: "Refresh token generated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  logginUser,
  refreshToken,
};
