### Due to growth or expansion of project, the process of compilaiton in production needs lot of memory to optimize huge javascript and css.
in this case run below command:
> open ~/.bash_profile
> increase size of heap memory for node js for e.g.
export NODE_OPTIONS=--max_old_space_size = 4096
* 2048 was extended to 4096
after making change, just save and run
> source  ~/.bash_profile
build project in production release mode for e.g.
> ionic cordova build ios --prod --release


ref:
https://github.com/ionic-team/ionic-app-scripts/issues/1036#issuecomment-473270156


Starting from scratch (clean project):


First adding platforms:

// make sure it is at least cordova-android@8.0.0 

ionic cordova platform add android

// make sure it is at least cordova-ios@5.0.0 
ionic cordova platform add ios


Adding plugins Weibo Wechat, please note both require keys

thereofre adding of these plugins should be done as follows 

ionic cordova plugin add cordova-plugin-wechat --variable WECHATAPPID="wxe6b2c324acb2b286"

ionic cordova plugin add cordova-plugin-weibosdk --variable WEIBO_APP_ID="1169932424"

Plugin deeplinks requires configs also. therefore add plugin with commands

ionic cordova plugin add  ionic-plugin-deeplinks --variable URL_SCHEME="pjapp" --variable DEEPLINK_HOST="pjdarenapp.com" --variable DEEPLINK_SCHEME="https"





 ### debug building.

ionic cordova build android
ionic cordova build ios

## Release for android and ios

ENV=prod ionic cordova build android --prod --release
ENV=prod ionic cordova build ios --prod --release
- Proceed with archiving from xcode if needed or run on device


### SIGNING of ANDROID APK


Curently It';s being handled by custom plugin  cordova-pj-plugin so no need to bother about signing. it will be signed for release and debug accordingly. 
if this  plugin  for some reason does'nt work. here is described manual method:


 social plugins Weibo , Wechat dont work for android if apk build wasn't signed same keystore as configured in the dev dashboard of Weibo and wechat 

for some reason ionic no longer signs apk after project update.. therefore there is use manual method of signing apk

Signing of apk is done using apksigner . it's provided by android build tools . 

 copy apk in foler where my-release-key.keystore is located. and execute following command .

Please NOTE:  app-release-unsigned.apk is apk which you need to sign .

apksigner sign --ks my-release-key.keystore --out app-release-signed.apk app-release-unsigned.apk

upon executing this command apksigner will ask Keystore password. input password: PJAPP123

Also It's possible to configure Android Studio to sign apk . need research for that




##### Alternative  more convinient method of signing apk which is proven not workable after update of ionic project.

1 Copy the files: debug-signing.properties and my-release-key.keystore into PLATFORMS/ANDROID
2.Copy the file: release-signing.properties into PLATFORMS/ANDROID


### Running on an emulator (Android based, for now)

Step 1: Create an emulator with Android Studio or via command line

    Step 1.1: Via command line execute the following:
        - touch ~/.android/repositories.cfg 
        - cd $ANDROID_HOME (wherever you have your android cli tools)
        - ./sdkmanager "system-images;android-26;google_apis;x86_64"
        - ./sdkmanager --licenses (Accept them all)
        - ./avdmanager create avd --force --name PixelXL --abi google_apis/x86_64 --package 'system-images;android-26:google_apis;x86_64' --device "PixelXL"
            This one is a definition of android virtual device based on PixelXL. For a full reference of other devices please take a look at 
            ./avdmanager list device
    
Step 2: Once available, and if it's the only emulator, you can run "ionic cordova emulate android". It will start a new emulator and it will install the app

Step 3: If, for some reason you're not able to debug using chrome://inspect, you can run the following commands:
    - emulator -avd PixelXL (or whatever avd you have created, to start the emulator, you can add -no-snapshot to start from scratch)
    - adb shell pm uninstall com.pjdaren.wom
    - adb install <apk path>


### RUNNING/BUILDING WITH DIFFERENT ENVIRONMENTS
In order to run this app with different configurations, without the need of modifying a file, you can run as follows
So far we have 4 different environments for testing --> local, dev, stage, pre-prod and prod
 - ionic serve (or equivalent) --> will read configurations from environment.ts
 - ENV=(local,dev,stage,pre-prod) ionic serve --> will start a dev build server for the selected environment 
 - ENV=(local,dev,stage,pre-prod) ionic cordova build (android,ios) --> will generate a debug build for the selected environment
 - ENV=(local,dev,stage,pre-prod,prod) ionic cordova build (android,ios) --prod --> will always generate an optimized build for "prod" environment, making the ENV actually optional