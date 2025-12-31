"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieFlagType = exports.MovieType = void 0;
var MovieType;
(function (MovieType) {
    MovieType["MOVIE"] = "MOVIE";
    MovieType["SERIES"] = "SERIES";
    MovieType["EPISODE"] = "EPISODE";
    MovieType["DOCUMENTARY"] = "DOCUMENTARY";
    MovieType["ANIMATION"] = "ANIMATION";
    MovieType["SHORT"] = "SHORT";
    MovieType["SPECIAL"] = "SPECIAL";
})(MovieType || (exports.MovieType = MovieType = {}));
var MovieFlagType;
(function (MovieFlagType) {
    MovieFlagType["TRENDING"] = "trending";
    MovieFlagType["HOT"] = "hot";
    MovieFlagType["FEATURED"] = "featured";
    MovieFlagType["FAVORITE"] = "favorite";
    MovieFlagType["PROMOTION"] = "promotion";
})(MovieFlagType || (exports.MovieFlagType = MovieFlagType = {}));
