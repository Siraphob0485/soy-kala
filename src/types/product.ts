export const productCategories = ["ของใช้", "ของตกแต่ง", "ของที่ระลึก"] as const;

export type ProductCategory = (typeof productCategories)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: string[];
  dimensions?: string;
  madeToOrder: boolean;
};
