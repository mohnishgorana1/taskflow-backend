import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "super-admin";
  isVerified: boolean;
  verifyToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin: Date;
  isDeleted: boolean;
  profilePicture?: string;
  preferences?: {
    theme: "light" | "dark";
    notifications: boolean;
  };
  status: "active" | "inactive" | "banned";
  plan?: "free" | "premium";
  activityLog?: {
    action: string;
    timestamp: Date;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): string;
  generatePasswordResetToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    verifyToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    lastLogin: { type: Date },
    isDeleted: { type: Boolean, default: false },
    profilePicture: { type: String },
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "dark" },
      notifications: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    plan: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      default: "free",
    },
    activityLog: [
      {
        action: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString("hex");
  this.verifyToken = token;
  return token;
};

userSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  return token;
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
