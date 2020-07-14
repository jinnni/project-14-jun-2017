import {Ugc} from "../data/ugc.interface";
//import ugcs from "../data/ugcs";
import {HttpService} from "./httpService";
import {Injectable} from "@angular/core";

@Injectable()
export class UgcService {
  static basePath = "/ugc";
  private ugcList: Ugc[];

constructor(private httpService: HttpService) {
    //this.ugcList = ugcs;
    this.httpService.GetUGC(true).subscribe(res =>{
      this.ugcList = res;
      });
}



  getAllUgcList(): Ugc[] {
    return this.ugcList;
  }

  getUgcById(ugcId: number): Ugc {
    const foundUgc = this.ugcList.find(ugc => {
      return ugc.id == ugcId
    });
    if (!foundUgc) {
      throw new Error("no ugc found with given id");
    }
    return foundUgc;
  }


}
