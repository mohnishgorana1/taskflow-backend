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

export const getUserDetailsByEmails = async (req: any, res: any) => {
  const { emails } = req.body;
  console.log("Requesting user details for email", emails);

  if (!emails) {
    return res.status(401).json({ success: false, message: "Missing Emails" });
  }

  // const user = await User.findOne({ email });
  const users = await User.find({ email: { $in: emails } }).select(
    "_id name email profilePicture"
  );
  if (!users) {
    return res.status(401).json({ success: false, message: "Users not found" });
  }

  return res.status(201).json({
    success: true,
    message: "Users Details Fetched SuccessFully",
    users,
  });
};

export const fetchUsers = async (req: any, res: any) => {
  const { userIds } = req.body;

  if (userIds.length <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user IDs" });
  }

  const users = await User.find({ _id: { $in: userIds } }).select(
    "_id name email profilePicture"
  );
  console.log("fetched USers", users);

  return res.status(201).json({ success: true, users });
};
