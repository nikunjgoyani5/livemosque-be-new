import { Request, Response } from "express";
import { Section } from "../models/Section";
import { reindexAllSections } from "../helper/order";

/** Get all */
export const getSections = async (_req: Request, res: Response) => {
  try {
    const sections = await Section.find().sort({ orderIndex: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/** Create */
export const createSection = async (req: Request, res: Response) => {
  try {
    let { orderIndex, ...rest } = req.body;

    // Append at end if no index provided
    if (!orderIndex) {
      const count = await Section.countDocuments();
      orderIndex = count + 1;
    }

    // Shift down those at or after the index
    await Section.updateMany(
      { orderIndex: { $gte: orderIndex } },
      { $inc: { orderIndex: 1 } }
    );

    const newSection = await Section.create({ ...rest, orderIndex });
    await reindexAllSections(); // keep clean
    res.status(201).json(newSection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/** Update (e.g. move index) */
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { orderIndex, ...rest } = req.body;

    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { ...rest, orderIndex },
      { new: true }
    );

    if (!section) return res.status(404).json({ message: "Not found" });
    await reindexAllSections();
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/** Soft delete */
export const deleteSection = async (req: Request, res: Response) => {
  try {
    await Section.findByIdAndUpdate(req.params.id, { visible: false });
    // optional: physically remove: await Section.findByIdAndDelete(req.params.id);
    await reindexAllSections();
    res.json({ message: "Section hidden" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
