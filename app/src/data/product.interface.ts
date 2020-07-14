export interface Product {
  id: number;
  categoryId: number;
  name: string;
  rating: number;
  tmPrice: number;
  jdPrice: number;
  imageName: string;
  liked:boolean;
  likeCount:number;
  relatedProductsId?: number[];
  badges: any[];
}
