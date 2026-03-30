import { Schema, Document, model, models } from "mongoose";

export interface ISavedTerm extends Document {
  licenseKey: string;
  term: string;
  situation: string;
  savedAt: Date;
}

const SavedTermSchema = new Schema<ISavedTerm>({
  licenseKey: { type: String, required: true },
  term: { type: String, required: true },
  situation: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
});

export default models.SavedTerm || model<ISavedTerm>("SavedTerm", SavedTermSchema);
