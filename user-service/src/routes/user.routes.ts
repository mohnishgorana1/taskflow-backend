import express from "express";
import { verifyUser } from "../controllers/user.controller";

const router = express.Router();

router.post("/verify", verifyUser);

export default router;
