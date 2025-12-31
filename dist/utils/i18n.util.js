"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalizedValue = exports.getLocalizedValueMap = void 0;
const getLocalizedValueMap = (map, lang, fallback) => {
    if (!map)
        return null;
    return map.get(lang) || map.get(fallback) || null;
};
exports.getLocalizedValueMap = getLocalizedValueMap;
const getLocalizedValue = (obj, lang, fallback) => {
    if (!obj)
        return null;
    return obj[lang] || obj[fallback] || null;
};
exports.getLocalizedValue = getLocalizedValue;
