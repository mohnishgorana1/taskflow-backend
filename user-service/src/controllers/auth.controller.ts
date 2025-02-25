import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { redisClient } from "../config/redis";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";

dotenv.config();

export const register = async (req: any, res: any) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ success: false, message: "Missing Required Fields" });
  }
  console.log("register", name, email, password, role);
  try {
    const existingUser = await User.findOne({ email });
    console.log("Existing", existingUser);

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    console.log("creating new user");

    const newUser = new User({
      name,
      email,
      password,
      role: role || "user",
    });

    await newUser.save();

    // generate JWT TOKENS
    console.log("generating tokens");

    const accessToken = generateAccessToken(String(newUser._id));
    const refreshToken = generateRefreshToken(String(newUser._id));

    // stre refresh token in redis for session nmgt
    await redisClient.set(`refreshToken:${newUser._id}`, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    console.log("registere success", newUser, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
      // verificationToken, // This should be sent via email in a real application
    });
  } catch (error) {
    console.log("error", error);

    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error: error });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Required Fields" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    // Store refresh token in Redis (Session Management)
    await redisClient.set(`refreshToken:${user._id}`, refreshToken, {
      EX: 7 * 24 * 60 * 60,
    }); // Expires in 7 days

    // Set refresh token as an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const logout = async (req: any, res: any) => {
  try {
    const userId = await req.user?.id; // Extract user ID from `req.user` (middleware should add this)

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Remove refresh token from Redis
    await redisClient.del(`refreshToken:${userId}`);

    // Clear refresh token cookie from client
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const refreshAccessToken = async (req: any, res: any) => {
  //  Access tokens expire quickly (e.g., 15 minutes).
  // Refresh tokens last longer (e.g., 7 days).
  // When an access token expires, the client sends a refresh request with the refresh token.
  // The server validates the refresh token and issues a new access token.
  // The refresh token is stored securely (e.g., in HTTP-only cookies) and managed via Redis.

  // 🛡️ Why Store Refresh Tokens in Redis?
  // Allows session management (e.g., logging out a user from all devices).
  // If a user logs out or is blocked, we can invalidate their refresh token.
  // Prevents reuse of stolen refresh tokens.
  try {
    const refreshToken = req.cookies?.refreshToken;
    console.log("refreshToken", refreshToken);

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (err: any, decoded: any) => {
        if (err) {
          console.log("err verify", err);
          
          return res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token",
          });
        }

        const userId = decoded.userId;
        console.log("userID", decoded.userId);
        
        const storedToken = await redisClient.get(`refreshToken:${userId}`);
        console.log("stored token in redis", storedToken);
        
        if (!storedToken || storedToken !== refreshToken) {
          console.log("stored token is not refreshtoken");
          
          return res.status(403).json({
            success: false,
            message: "Invalid session, please log in again",
          });
        }

        // Generate new access token
        const newAccessToken = jwt.sign(
          { id: userId },
          process.env.ACCESS_TOKEN_SECRET as string,
          {
            expiresIn: "15m",
          }
        );

        return res.status(200).json({
          success: true,
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const getCurrentUser = async (req: any, res: any) => {
  try {
    console.log("curre user", req?.user);

    return res.status(200).json({ sucess: true, user: req.user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};
