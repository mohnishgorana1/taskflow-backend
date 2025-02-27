import express from "express";
import {
  verifyUser,
  getUserDetailsByEmail,
  fetchUsers,
} from "../controllers/user.controller";

const router = express.Router();

router.post("/verify", verifyUser);
router.get("/:email/", getUserDetailsByEmail);
router.post("/fetch-users", fetchUsers);

export default router;
