import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ILicenseKey extends Document {
  licenseKey: string;
  email: string;
  activatedAt: Date;
}

const LicenseKeySchema = new Schema<ILicenseKey>({
  licenseKey: { type: String, required: true, unique: true },
  email: { type: String },
  activatedAt: { type: Date, default: Date.now },
});

export default models.LicenseKey || model<ILicenseKey>("LicenseKey", LicenseKeySchema);
