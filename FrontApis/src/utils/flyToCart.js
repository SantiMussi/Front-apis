export function flyImageToCart(sourceImgEl) {
  if (!sourceImgEl) return;

  const cartIcon = document.getElementById("cart-icon");
  if (!cartIcon) return;

  const imgRect = sourceImgEl.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flyingImg = sourceImgEl.cloneNode(true);
  flyingImg.style.position = "fixed";
  flyingImg.style.left = imgRect.left + "px";
  flyingImg.style.top = imgRect.top + "px";
  flyingImg.style.width = imgRect.width + "px";
  flyingImg.style.height = imgRect.height + "px";
  flyingImg.style.pointerEvents = "none";
  flyingImg.style.zIndex = 9999;
  flyingImg.style.transition =
    "transform 0.6s ease-out, opacity 0.6s ease-out";

  document.body.appendChild(flyingImg);

  const translateX =
    cartRect.left + cartRect.width / 2 - (imgRect.left + imgRect.width / 2);
  const translateY =
    cartRect.top + cartRect.height / 2 - (imgRect.top + imgRect.height / 2);

  // forzar reflow
  void flyingImg.offsetWidth;

  flyingImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`;
  flyingImg.style.opacity = "0.2";

  flyingImg.addEventListener(
    "transitionend",
    () => {
      flyingImg.remove();
    },
    { once: true }
  );
}
