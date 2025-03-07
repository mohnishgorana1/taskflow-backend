"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUsers = exports.getUserDetailsByEmails = exports.verifyUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "No token provided" });
    }
    try {
        //   verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.default.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found to verify",
            });
        }
        return res.status(200).json({ success: true, user });
    }
    catch (error) {
        console.log("Error verifying user", error);
        return res
            .status(403)
            .json({ success: false, message: "Invalid token", error });
    }
});
exports.verifyUser = verifyUser;
const getUserDetailsByEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emails } = req.body;
    console.log("Requesting user details for email", emails);
    if (!emails) {
        return res.status(401).json({ success: false, message: "Missing Emails" });
    }
    // const user = await User.findOne({ email });
    const users = yield user_model_1.default.find({ email: { $in: emails } }).select("_id name email profilePicture");
    if (!users) {
        return res.status(401).json({ success: false, message: "Users not found" });
    }
    return res.status(201).json({
        success: true,
        message: "Users Details Fetched SuccessFully",
        users,
    });
});
exports.getUserDetailsByEmails = getUserDetailsByEmails;
const fetchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userIds } = req.body;
    if (userIds.length <= 0) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid user IDs" });
    }
    const users = yield user_model_1.default.find({ _id: { $in: userIds } }).select("_id name email profilePicture");
    console.log("fetched USers", users);
    return res.status(201).json({ success: true, users });
});
exports.fetchUsers = fetchUsers;
