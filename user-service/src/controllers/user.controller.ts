import User from "../models/user.model";
import jwt from "jsonwebtoken";

export const verifyUser = async (req: any, res: any) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    //   verify token
    const decoded: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found to verify",
      });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error verifying user", error);

    return res
      .status(403)
      .json({ success: false, message: "Invalid token", error });
  }
};
