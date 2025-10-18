export const normalizeBase64Image = (value) => {
  if (!value) return null;
  return value.startsWith("data:") ? value : `data:image/png;base64,${value}`;
};