import { Request, Response } from "express";
import { ISection, Section } from "../models/Section";
import { reindexAllSections } from "../helper/order";

/** Get all */
export const getSections = async (_req: Request, res: Response) => {
  try {
    const sections: ISection[] = await Section.find({}).sort({
      orderIndex: 1,
    });
    const grouped = sections
      // 1️⃣ sort whole array first by orderIndex
      .sort((a, b) => a.orderIndex - b.orderIndex)
      // 2️⃣ then group by type
      .reduce((acc: any, item) => {
        const type = item.type;

        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(item);
        return acc;
      }, {});

    // 3️⃣ sort each group by orderIndex again (safety)
    Object.keys(grouped).forEach((type) => {
      grouped[type].sort((a: any, b: any) => a.orderIndex - b.orderIndex);
    });

    // 4️⃣ if you want single-item types to be object instead of array:
    Object.keys(grouped).forEach((type) => {
      if (grouped[type].length === 1) {
        grouped[type] = grouped[type][0];
      }
    });

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/** Get By ID */
export const getSectionsById = async (req: Request, res: Response) => {
  try {
    const section = await Section.findById(req.params.id);
    res.json(section);
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
    await Section.findByIdAndDelete(req.params.id);
    // optional: physically remove: await Section.findByIdAndDelete(req.params.id);
    await reindexAllSections();
    res.json({ message: "Section hidden" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route GET /api/blogs
 * @desc Get all blogs from the "LATEST_NEWS" section
 */
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const section = await Section.findOne({ type: "LATEST_NEWS" });

    if (!section || !section.content?.data) {
      return res.status(404).json({ message: "No blogs found" });
    }

    // Optionally sort by date (assuming postdate is a readable string)
    const blogs = section.content.data.sort(
      (a: any, b: any) =>
        new Date(b.postdate).getTime() - new Date(a.postdate).getTime()
    );

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @route GET /api/blogs/:index
 * @desc Get a single blog detail by its index or id
 */
export const getBlogDetail = async (req: Request, res: Response) => {
  try {
    const section = await Section.findOne({ type: "LATEST_NEWS" });

    if (!section || !section.content?.data) {
      return res.status(404).json({ message: "No blogs found" });
    }

    // You can identify blogs either by index or by a unique title / slug
    const { index } = req.params;
    const blogIndex = Number(index);

    if (!Number.isInteger(blogIndex) || blogIndex < 0) {
      return res.status(400).json({ message: "Invalid blog index" });
    }

    const blog = section.content.data[blogIndex];

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog detail:", error);
    res.status(500).json({ message: "Server error" });
  }
};
