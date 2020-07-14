import {Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {User} from "../model/user";
@Injectable()
export class UserService {
  static basePath = "/users";

  constructor(private httpService: HttpService) {
  }

  signIn(phoneNumber: string, password: string) {
    return this.httpService
      .postWithExceptionHandleLogin(UserService.basePath + "/login",  {
        "username": phoneNumber,
        "password": password,
        "rememberMe": true,
      }, false);
  }

  signOut() {
    return this.httpService
      .post(UserService.basePath + "/logout", null);
  }

  /*verifyPhoneNumber(phoneNumber,password) {
    return this.httpService
      .post(UserService.basePath + "/verify", {
        "phoneNumber": phoneNumber,
        "password": password
      }, false);
  }*/
  verifyPhoneNumber(phoneNumber,password) {
    if(password!=""){
      return this.httpService
      .postWithExceptionHandleLogin(UserService.basePath + "/verify", {
        "phoneNumber": phoneNumber,
        "password": password
      }, false);
    }
    else{
      return this.httpService
      .postWithExceptionHandleLogin(UserService.basePath + "/verify", {
        "phoneNumber": phoneNumber
      }, false);
    }
  }


  update(user: any,authToken:string) {
    return this.httpService
      .putUserInfo(UserService.basePath, user,authToken);
  }

  testToken() {
    return this.httpService
      .get(UserService.basePath + "/tokenTest");
  }

  getUserData() {
    return this.httpService.get(UserService.basePath + "/account");
  }
  postSaveNickname(nickName: string,userId:number){
    return this.httpService
      .put("/users/"+userId+"/change-nickname",  {
        "nickname": nickName
      }, true);
  }
  postSaveNewEmail(oldEmail: string,newEmail: string,userId:number){
    return this.httpService
      .put("/users/"+userId+"/change-email",  {
        "oldEmail": oldEmail,
        "newEmail": newEmail,
      }, true);
  }
  postSaveNewPassword(oldPassword: string,newPassword: string,userId:number){
    return this.httpService
      .put("/users/"+userId+"/change-password",  {
        "oldPassword": oldPassword,
        "newPassword": newPassword,
      }, true);
  }
  postSendVarificationCode(newPhoneNumber: string)
  {
    return this.httpService
      .put("/users/send-verification-code",  {
        "newPhoneNumber": newPhoneNumber
      }, true);
  }
  postSaveNewPhone(newPhoneNumber: string,oldPhoneNumber: string,code: string,userId:number)
  {
    return this.httpService
      .put("/users/"+userId+"/change-phone",  {
        "newPhoneNumber": newPhoneNumber,
        "oldPhoneNumber": oldPhoneNumber,
        "code":code
      }, true);
  }
}
