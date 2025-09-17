import mongoose, { Document, Schema } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
}

const AdminSchema: Schema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
