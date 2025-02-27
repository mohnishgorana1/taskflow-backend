import mongoose, { Document, Schema } from "mongoose";

export interface ITimeTrack extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  timeSpent: number;
  startTime: Date;
  endTime: Date;
}
const TimeTrackSchema: Schema = new Schema(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timeSpent: { type: Number, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITimeTrack>("TimeTrack", TimeTrackSchema);

// this model is user specific
// means a task can assigned to multiple users and
//  for a particular task how much time a particular user takes to do the task
