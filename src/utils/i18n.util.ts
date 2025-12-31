export const getLocalizedValueMap = (
  map: Map<string, string> | undefined,
  lang: string,
  fallback: string
) => {
  if (!map) return null;
  return map.get(lang) || map.get(fallback) || null;
};
export const getLocalizedValue = (
  obj: Record<string, string> | undefined,
  lang: string,
  fallback: string
) => {
  if (!obj) return null;
  return obj[lang] || obj[fallback] || null;
};
