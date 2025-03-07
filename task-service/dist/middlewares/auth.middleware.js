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
exports.authMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const response = yield axios_1.default.post(`${process.env.USER_SERVICE_URL}/verify`, { token: token }, { headers: { Authorization: `Bearer ${token}` } });
        // console.log("verify response", response);
        // Attach the user to the request
        if (response.data.success) {
            req.user = response.data.user;
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Problem in verify user",
                errorMessage: (_a = response.data) === null || _a === void 0 ? void 0 : _a.message,
            });
        }
        next();
    }
    catch (error) {
        console.log("Auth Middleware Erro in task service", error);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
});
exports.authMiddleware = authMiddleware;
