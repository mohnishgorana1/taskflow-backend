import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "to-do" | "in-progress" | "done";
  dueDate?: Date;
  assignedTo: mongoose.Types.ObjectId[]; // multiple users,
  projectId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  subtasks?: { title: string; isCompleted: boolean }[];
  attachments?: string[];
  labels?: string[];
  comments?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
const TaskSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    status: {
      type: String,
      enum: ["to-do", "in-progress", "done"],
      default: "to-do",
    },
    dueDate: { type: Date },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }], // Multiple users
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    subtasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
      },
    ], // Fixed: Match schema & interface
    attachments: [{ type: String }], // File URLs
    labels: [{ type: String }], // Color-coded labels
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>("Task", TaskSchema);
