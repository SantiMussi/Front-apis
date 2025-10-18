/* Funcion para asegurar que la URL de la imagen sea compatible con la etiqueta IMG  */

export function normalizeBase64Image(value){
  if (!value) return null;
  return value.startsWith("data:") ? value : `data:image/png;base64,${value}`;
};

