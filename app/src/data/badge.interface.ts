import {Product} from "./product.interface";
export interface Badge {

  id: number;
  createdOn: Date;
  updatedOn: Date;
  name: string;
  description: string;
  content: string;
  badgeTypeId: number;
  badgeType:{
    id:number;
    createdOn: Date;
    updatedOn: Date;
    name:string;
  }
  point:number;
  imageName:string;
  goalScore: number;
  reviewScore: number;
  answerScore: number;
  products:Product[];

  /*id: number;
  type: string;
  name: string;
  description: string;
  content: string;
  image: string;
  relatedProductsId: number[];
  goalScore: number;
  reviewScore: number;
  answerScore: number;*/
}
