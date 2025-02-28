import express from "express";
import {
  verifyUser,
  getUserDetailsByEmails,
  fetchUsers,
} from "../controllers/user.controller";

const router = express.Router();

router.post("/verify", verifyUser);
router.post("/", getUserDetailsByEmails);
router.post("/fetch-users", fetchUsers);

export default router;
