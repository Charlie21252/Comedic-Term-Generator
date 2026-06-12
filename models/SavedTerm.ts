import { Schema, Document, model, models } from "mongoose";

export interface ISavedTerm extends Document {
  licenseKey: string;
  term: string;
  situation: string;
  savedAt: Date;
  shared: boolean;
}

const SavedTermSchema = new Schema<ISavedTerm>({
  licenseKey: { type: String, required: true },
  term: { type: String, required: true },
  situation: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
  shared: { type: Boolean, default: false },
});

SavedTermSchema.index({ shared: 1, savedAt: -1 });

export default models.SavedTerm || model<ISavedTerm>("SavedTerm", SavedTermSchema);
