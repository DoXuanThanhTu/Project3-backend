"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodeModel = void 0;
const mongoose_1 = require("mongoose");
const episodeSchema = new mongoose_1.Schema({
    movieId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Movie", required: true },
    serverId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Server", required: true },
    title: { type: Map, of: String },
    description: { type: Map, of: String },
    slug: { type: Map, of: String },
    defaultLang: { type: String },
    episodeOrLabel: String,
    duration: String,
    thumbnail: String,
    videoUrl: String,
    isPublished: { type: Boolean, default: true },
}, { timestamps: true });
exports.EpisodeModel = (0, mongoose_1.model)("Episode", episodeSchema);
