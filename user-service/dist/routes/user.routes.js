"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.post("/verify", user_controller_1.verifyUser);
router.post("/", user_controller_1.getUserDetailsByEmails);
router.post("/fetch-users", user_controller_1.fetchUsers);
exports.default = router;
