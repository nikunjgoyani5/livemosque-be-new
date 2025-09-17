import { Request, Response } from "express";
import { Section } from "../models/Section";

// GET all sections
export const getSections = async (req: Request, res: Response) => {
  try {
    const sections = await Section.find().sort({ orderIndex: 1 });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create section
export const createSection = async (req: Request, res: Response) => {
  try {
    const section = await Section.create(req.body);
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update section
export const updateSection = async (req: Request, res: Response) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!section) return res.status(404).json({ message: "Not found" });
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete section
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Section deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
