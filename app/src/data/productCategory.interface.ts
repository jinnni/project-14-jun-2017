export interface productCategory {
  id: number;
  name: string;
  subCategories: productCategory[];
}
