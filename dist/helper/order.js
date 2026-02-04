"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reindexAllSections = void 0;
// helpers/order.ts
const Section_1 = require("../models/Section");
/** Recalculate all orderIndex in ascending order (1..n) */
const reindexAllSections = async () => {
    const sections = await Section_1.Section.find().sort({ orderIndex: 1 });
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].orderIndex !== i + 1) {
            await Section_1.Section.findByIdAndUpdate(sections[i]._id, { orderIndex: i + 1 });
        }
    }
};
exports.reindexAllSections = reindexAllSections;
//# sourceMappingURL=order.js.map