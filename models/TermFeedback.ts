import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITermFeedback extends Document {
  term: string;
  situation: string;
  vote: "like" | "dislike";
  createdAt: Date;
}

const TermFeedbackSchema = new Schema<ITermFeedback>({
  term:      { type: String, required: true },
  situation: { type: String, required: true },
  vote:      { type: String, enum: ["like", "dislike"], required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation during Next.js hot reloads
const TermFeedback: Model<ITermFeedback> =
  (mongoose.models.TermFeedback as Model<ITermFeedback>) ??
  mongoose.model<ITermFeedback>("TermFeedback", TermFeedbackSchema, "termFeedback");

export default TermFeedback;
