import catalog from "./product-images.json";
export const productImages = catalog;
export const normalizeProduct = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
export const findProductImage = (imageId?: string, name = "") =>
  imageId === ""
    ? undefined
    : catalog.find((image) => image.key === imageId) ||
      catalog.find((image) =>
        image.tags.some((tag) => normalizeProduct(name).includes(tag)),
      );
