import {Storage} from "@ionic/storage";
import {GlobalVariable} from "../global/global.variable";
import {Injectable} from "@angular/core";

@Injectable()
export class TokenService {

  static tokenKey = "token";
  static userId = "userId";
  static isAuthUser = "isAuthUser";

  constructor(private storage: Storage) {
  }

  save(token: string) {
    this.storage.set(TokenService.tokenKey, token);
    GlobalVariable.token = token;
  }
  saveUserId(userId: string) {
    this.storage.set(TokenService.userId, userId);
    GlobalVariable.userId = userId;
  }
  saveIsUserAuth(isYes: boolean) {
    this.storage.set(TokenService.isAuthUser, isYes);
    GlobalVariable.isAuthUser = isYes;
  }

  load(): Promise<any> {
    return this.storage.get(TokenService.tokenKey);
  }
  loadIsUserAuth(): Promise<any> {
    return this.storage.get(TokenService.isAuthUser);
  }
}
