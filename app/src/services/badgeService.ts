import {Injectable} from '@angular/core';
import {Badge} from "../data/badge.interface";
import {HttpService} from "./httpService";

@Injectable()

export class BadgeService {
  private badgeList: Badge[];

  pageNo:number = 0;

  constructor(private httpService:HttpService) {
    //this.badgeList = badges;
    this.BadgeListLoad();
  }

  BadgeListLoad(){
    this.httpService.GetBadgesList(this.pageNo).subscribe(res =>{
      let countproduct=0;
      this.badgeList=[];
      for(let item of res){
          this.badgeList[countproduct]=item;
          countproduct++;
      }
    });
  }
  

  getBadgeList(): Badge[] {
    return this.badgeList.slice();
  }

  /*getBadgeListByType(type: string): Badge[] {
    return this.badgeList.filter(badge => {
      return badge.type == type;
    });
  }

  getBadgeListByProductId(productId: number): Badge[] {
    return this.badgeList.filter(badge => {
      return badge.relatedProductsId.indexOf(productId) >= 0;
    }).map(badge => {
      badge.type
      return badge;
    });
  }*/



  /*Old
  getBadgeById(badgeId: number): Badge {
    return this.badgeList.find(badge => {
      return badge.id == badgeId;
    });
  }*/
}
