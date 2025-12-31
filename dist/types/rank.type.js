"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankType = exports.RankPeriod = void 0;
var RankPeriod;
(function (RankPeriod) {
    RankPeriod["DAILY"] = "daily";
    RankPeriod["WEEKLY"] = "weekly";
    RankPeriod["MONTHLY"] = "monthly";
    RankPeriod["YEARLY"] = "yearly";
    RankPeriod["ALL_TIME"] = "all_time";
})(RankPeriod || (exports.RankPeriod = RankPeriod = {}));
var RankType;
(function (RankType) {
    RankType["MOST_VIEWED"] = "most_viewed";
    RankType["TOP_RATED"] = "top_rated";
    RankType["NEWEST"] = "newest";
    RankType["TRENDING"] = "trending";
    RankType["RECOMMENDED"] = "recommended";
})(RankType || (exports.RankType = RankType = {}));
