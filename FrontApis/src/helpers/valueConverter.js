export function toNumberOrEmpty(value){
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? "" : String(parsed);
};


export function toDisplayValue(value){
    return (value === null || value === undefined ? "" : value);
}