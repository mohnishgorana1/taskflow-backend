import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  title: string;
  description?: string;
  projectAdmin: mongoose.Types.ObjectId;
  teamMembers?: mongoose.Types.ObjectId[];
  tasks?: mongoose.Types.ObjectId[];
  visibility: "private" | "public";
  createdAt: Date;
  updatedAt: Date;
}
const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    projectAdmin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    teamMembers: [{ type: Schema.Types.ObjectId, ref: "User" }], // Multiple users
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    visibility: {
      type: String,
      enum: ["private", "public"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>("Project", ProjectSchema);
