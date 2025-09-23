// helpers/order.ts
import { Section } from "../models/Section";

/** Recalculate all orderIndex in ascending order (1..n) */
export const reindexAllSections = async () => {
  const sections = await Section.find().sort({ orderIndex: 1 });
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].orderIndex !== i + 1) {
      await Section.findByIdAndUpdate(sections[i]._id, { orderIndex: i + 1 });
    }
  }
};
