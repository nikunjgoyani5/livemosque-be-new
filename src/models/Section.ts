import mongoose, { Document, Schema } from "mongoose";

interface IImage {
  url: string;
  imageType?: string;
}

export interface ISection extends Document {
  name: string;
  slug: string;
  orderIndex: number;
  visible: boolean;
  isSection: boolean;
  page: string;
  type: string;
  content: Record<string, any>;
  media: IImage[];
}

const ImageSchema = new Schema<IImage>({
  url: { type: String, required: true },
  imageType: {
    type: String,
    required: true,
    enum: ["image", "video"],
    default: "image",
  },
});

const SectionSchema: Schema = new Schema<ISection>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    orderIndex: { type: Number, required: true, default: 1 },
    visible: { type: Boolean, default: true },
    isSection: { type: Boolean, default: true },
    type: { type: String, required: true },
    page: { type: String, required: true },
    content: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Section = mongoose.model<ISection>("Section", SectionSchema);
