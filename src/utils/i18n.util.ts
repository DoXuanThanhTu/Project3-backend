export const getLocalizedValue = (
  map: Map<string, string> | undefined,
  lang: string,
  fallback: string
) => {
  if (!map) return null;
  return map.get(lang) || map.get(fallback) || null;
};
