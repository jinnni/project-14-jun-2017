package com.pjdaren.wom;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.support.v4.app.NotificationManagerCompat;
import android.util.Log;

public class PJPlugin extends CordovaPlugin {
  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

    try {
      if (action.equals("notificationAuthorizationStatus")) {

       Boolean isEnabled = NotificationManagerCompat.from(this.cordova.getActivity()).areNotificationsEnabled();
       if (isEnabled){
         callbackContext.success("authorized");
       }else {
         callbackContext.error("unauthorized");
       }
       
        return true;
      }
      if (action.equals("openAppSettings")) {
        try {
          openAppSettings(callbackContext);
        }catch (Exception e){
          Log.e("openAppSettings" , e.getMessage());
          callbackContext.error(e.getMessage());
        }

        return true;
      }
      if (action.equals("getVersionNumber")) {
        PackageManager packageManager = this.cordova.getActivity().getPackageManager();
        callbackContext.success(packageManager.getPackageInfo(this.cordova.getActivity().getPackageName(), 0).versionName);
      return true;
      }
      if (action.equals("getVersionCode")) {
        PackageManager packageManager = this.cordova.getActivity().getPackageManager();
        callbackContext.success(packageManager.getPackageInfo(this.cordova.getActivity().getPackageName(), 0).versionCode);
      return true;
      }
      return false;
    } catch (NameNotFoundException e) {
      callbackContext.success("N/A");
      return true;
    }
  }

  void  openAppSettings(CallbackContext callbackContext){

    String result = "opened";
    callbackContext.success(this.cordova.getActivity().getPackageName());

    Context context=this.cordova.getActivity().getApplicationContext();
    PluginResult.Status status = PluginResult.Status.OK;
    Uri packageUri = Uri.parse("package:" + this.cordova.getActivity().getPackageName());
    Intent intent = null;

    intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS, packageUri);

    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    this.cordova.getActivity().startActivity(intent);

    callbackContext.sendPluginResult(new PluginResult(status, result));

  }

}
