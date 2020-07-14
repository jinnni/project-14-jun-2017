import {Storage} from "@ionic/storage";
import { Injectable } from "@angular/core";
import { GlobalVariable } from "../global/global.variable";
import {ENV} from "@app/env";
import {App} from 'ionic-angular';
import { SignInUpPage } from "../pages/sign-in-up/sign-in-up";
@Injectable()
export class StorageService {
    
    constructor(private storage: Storage,
        public appCtrl: App) {

    }

    clearAll() {
        console.log("@StorageService.clearAll ");
        this.storage.clear();
        localStorage.clear();
        GlobalVariable.token = "";
        GlobalVariable.isAuthUser = false;
        localStorage.setItem("myImageUrl", ENV.imageUrl);
        this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage);
    }
}