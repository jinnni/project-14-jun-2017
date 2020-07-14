import {Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {Product} from "../data/product.interface";

@Injectable()
export class ProductService {
  static basePath = "/products";
  private productsList: Product[];
  constructor(private httpService: HttpService) {
    // this.ProductLoad(productId);
  }

  ProductLoad(productId){
    
  }

  getProductsList(): Product[] {
    return this.productsList.slice();
  }

  // getProductById(productId: number): Product {
  //   return this.productsList.find((productItem: Product) => {
  //     return productItem.id == productId;
  //   });
  // }
  getProductById(productId: number) {
    return new Promise((res,rej) =>{
      this.httpService.GetProductByID(productId).subscribe(resp => {
         res = resp;
      });
    })
    // return this.productsList.find((productItem: Product) => {
    //   return productItem.id == productId;
    // });
  }

  getProductsListByCategoryId(categoryId: number): Product[] {
    return this.productsList.filter((productItem: Product) => {
      return productItem.categoryId == categoryId;
    });
  }
  /*Add Review From Timeline or Badge Screen */
  addReview(content: string,rating: number,productId: number,userId: number,badgeId:any){
    return this.httpService
      .post("/review",  {
        "content": content,
        "rating": rating,
        "productId": productId,
        "userId": userId,
        "badgeId":badgeId
      }, true);
  }
  /*Add Review From challenge screen*/
  addReviewChallenge(content:string,rating:number,productId:number,badgeId:number,challengeId:number,userId:number){
    return this.httpService
      .post("/review",  {
        "content": content,
        "rating": rating,
        "productId": productId,
        "badgeId":badgeId,
        "challengeId":challengeId,
        "userId": userId
      }, true);
  }
  addReviewQuestion(review_question: string,productId: number,userId: number){
    return this.httpService
      .post("/question",  {
        "content": review_question,
        "productId": productId,
        "userId": userId,
      }, true);
  }
}
