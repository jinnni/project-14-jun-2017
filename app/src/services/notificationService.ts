
import {Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import { Platform } from "ionic-angular";

import { AndroidPermissions } from '@ionic-native/android-permissions';
import { isNull } from "util";
import { r } from "@angular/core/src/render3";
declare var Pushy:any;
declare let PjPlugin:any;

@Injectable()

export class NotificationService {

    constructor(private httpService: HttpService , private platform: Platform, private androidPermissions: AndroidPermissions){

    }

    public  registerDevcie(){

        return new Promise( (resolved, rejected) => {
            const that = this;
            if( !this.platform.is('cordova')){
                console.log("Push notifications not supported in the system")
                rejected()
                return;
            }
            that.checkStoragePermissions()
            .then(() => {
                   that.registerPushy()
                   .then( () => resolved())
                   .catch( (e) => rejected(e));
            }).catch( (e) => rejected(e) )
        } )
    }

    private checkStoragePermissions(){
        const that = this
        return new Promise( (resolve, reject) => {
            if(!this.platform.is('android')){
                resolve(true)
                return
            }
            this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE).then(
                result => {
                    if(result.hasPermission){
                        resolve(true)
                    }else{
                        Pushy.requestStoragePermission()
                    }
                },
                err => {
                    Pushy.requestStoragePermission()
                } 

              );
        } )
    }

    private registerPushy(){
        Pushy.listen();
    
   //     Pushy.requestStoragePermission();
        const that = this

        return new Promise( (resolved, rejected) => {
                Pushy.register(function (err, deviceToken) {
                        console.log(" Pushy deviceToken: ", deviceToken)
                                if(err || !deviceToken){
                                    console.log("registrationError: " , JSON.stringify(err))
                                    rejected()
                                    return;
                                }
                                localStorage.setItem("deviceToken", deviceToken)
                                that.httpService.registerDeviceToken(deviceToken).subscribe( (res: any) =>{
                                        resolved(deviceToken)
                                        console.log("registerDeviceToken: res", JSON.stringify(res))
                                    } , (res) => {
                                        rejected()
                                        console.log("registerErrorToken: res", JSON.stringify(res))
                                    })
                    })
        }) 
    }

    public setNotificationListener(listener: any){
        Pushy.setNotificationListener(function (data) {
            // Notification tapped in background?
            if(listener != null){
                listener(data)
            }
         });

    }
    public unRegisterDevcie(){
        if( !this.platform.is('cordova')){
            console.log("Push notifications not supported in the system")
            return;
        }
        localStorage.setItem("deviceToken", null)

        return new Promise( (resolved, rejected) => {
            const that = this
            that.httpService.unregisterDeviceToken()
            .subscribe( (res) => {
                    console.log("unRegisterDevcie: success  " , JSON.stringify(res))
                   resolved(res)
            }, (err) => {
                console.log("unRegisterDevcie: error  " , JSON.stringify(err))
               rejected(err)
            } )
        } )
   
    }
    
}