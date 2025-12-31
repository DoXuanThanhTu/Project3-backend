"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchKeywordModel = void 0;
const mongoose_1 = require("mongoose");
const searchKeywordSchema = new mongoose_1.Schema({
    keyword: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    count: {
        type: Number,
        default: 1,
        min: 1,
    },
    lastSearched: {
        type: Date,
        default: Date.now,
        index: true,
    },
    language: {
        type: String,
        default: "vi",
    },
    deviceType: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "other"],
    },
    country: String,
}, {
    timestamps: true,
    // collection: 'searchkeywords',
});
// Index for trending searches
searchKeywordSchema.index({ lastSearched: -1, count: -1 });
searchKeywordSchema.index({ keyword: "text" });
exports.SearchKeywordModel = (0, mongoose_1.model)("SearchKeyword", searchKeywordSchema);
