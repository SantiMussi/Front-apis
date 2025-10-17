import { SIZE_OPTIONS } from "../../constants/product";
import {useState} from 'react'

function clamp01(n){
  if(n=== "" || n === null || n === undefined) return "";
  const x = Number(n);
  if(Number.isNaN(x)) return "";
  return Math.min(1, Math.max(0,x));
}

function ProductForm({
  title,
  product,
  categories,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
  isSubmitDisabled = false,
  cancelLabel = "Cancelar edición",
  sizeOptions = SIZE_OPTIONS,
  expectedWidth,
  expectedHeight,
  onImageValidationError,
}) {
  const [previewUrl, setPreviewUrl] = useState(product?.image_preview_url ?? null);

  const handleDiscountChange = (e)=> {
    const clamped = clamp01(e.target.value);
    onChange({
      target: {name: 'discount', value: clamped}
    })
  }

  const handleDiscountBlur = (e) => {
    const clamped = clamp01(e.target.value === "" ? 0 : e.target.value)
    onChange({
      target:{ name: 'discount', value: clamped}
    });
  };

  //Imagen -> base64 y validaciones
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0] || null;
    if(!file){
      onChange({ target: {name: 'base64img'}, value: ''})
      setPreviewUrl(null);
      return
    }

    //Validar el tipo
    const validTypes = ['image/jpeg', 'image/png'];
    if(!validTypes.includes(file.type)){
      onImageValidationError?.('Formato inválido. Sólo PNG o JPG')
      e.target.value = ""
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result; //String base64
      //Validar dimensiones

      if(expectedWidth || expectedHeight){
        validateImageDimensions(dataUrl).then(({width, height}) => {
          const okW = expectedWidth ? width === expectedWidth : true;
          const okH = expectedHeight ? height === expectedHeight : true;

          if(!okW || !okH){
            onImageValidationError?.(
              `Dimensiones inválidas. Se esperaba ${expectedWidth}x${expectedHeight ?? '?'} px y se recibió ${width}x${height} px`
            );
            e.target.value = "";
            return;
          }

          //Guardar base64 y preview
          onChange({target: {name: 'base64img', value: dataUrl}});
          setPreviewUrl(dataUrl);
        })
        .catch(() => {
          onImageValidationError?.('No se pudo leer la imagen para validar las dimensiones.')
          e.target.value = "";
        })
      } else {
        //Sin validacion de tamano
        onChange({target: {name: 'base64img', value: dataUrl}});
        setPreviewUrl(dataUrl);
      }
    };
    reader.onerror = () => {
      onImageValidationError?.("Error leyendo el archivo de imagen.")
      e.target.value = "";
    };
  };


  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {title && <h3>{title}</h3>}
      <div className="admin-form-grid">
        <label>
          Nombre
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Precio
          <input
            type="number"
            step="0.01"
            name="price"
            value={product.price}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            name="stock"
            value={product.stock}
            onChange={onChange}
            required
          />
        </label>
        <label>
          Descuento
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            name="discount"
            value={product.discount}
            onChange={handleDiscountChange}
            onBlur={handleDiscountBlur}
            placeholder="0 a 1 (Ej: 15% = 0.15)"
          />
        </label>

        {/* Img por archivo -> base64 */}
        <label>
          Imagen (JPG o PNG)
          <input
            type="file"
            id="fileselect"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
          />
          {expectedWidth || expectedHeight ? (
            <small>
              Dimensiones requeridas: {expectedWidth ?? '?'}x{expectedHeight ?? '?'} px
            </small>
          ) : (
            <small>Se admiten JPG o PNG.</small>
          )}
        </label>

        {(previewUrl) && (
          <div className='full-width'>
            <small>Vista previa:</small>
              <div className='admin-image-preview'>
                <img
                  src={previewUrl}
                  alt='Vista previa'
                  style={{maxWidth: 240, height: 'auto', display: 'block'}}
                />
              </div>
            </div>
        )}


        <label className="full-width">
          Descripción
          <textarea
            name="description"
            value={product.description}
            onChange={onChange}
            rows={3}
          />
        </label>
        <label>
          Talle
          <select
            className="admin-select"
            name="size"
            value={product.size}
            onChange={onChange}
            required
          >
            <option value="">Seleccionar talle</option>
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label>
          Categoría
          <select
            className="admin-select"
            name="categoryId"
            value={product.categoryId}
            onChange={onChange}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.description ?? `ID ${category.id}`}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="admin-form-actions">
        {onCancel && (
          <button
            type="button"
            className="admin-button ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          className="admin-button primary"
          disabled={isSubmitting || isSubmitDisabled}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/* Helpers */
function validateImageDimensions(dataUrl){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({width: img.naturalWidth, height: img.naturalHeight});
    
    img.onerror = reject;
    img.src = dataUrl;
    })
}


export default ProductForm;