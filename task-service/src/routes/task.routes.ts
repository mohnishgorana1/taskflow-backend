import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authMiddleware, (req: any, res: any) => {
  console.log("getting all task", req.user);
  return res.status(200).json({ success: true, message: "working" });
});

export default router;
