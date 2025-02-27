import axios from "axios";
import { AuthenticatedRequest } from "../types";
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: any,
  next: any
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];

    // console.log("accesstoken", token);
    // console.log(`user service url: , ${process.env.USER_SERVICE_URL}/verify`);

    // Call the User Service `/verify` route
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/verify`,
      { token: token },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // console.log("verify response", response);

    // Attach the user to the request
    if (response.data.success) {
      req.user = response.data.user;
    } else {
      return res.status(401).json({
        success: false,
        message: "Problem in verify user",
        errorMessage: response.data?.message,
      });
    }

    next();
  } catch (error) {
    console.log("Auth Middleware Erro in task service", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
