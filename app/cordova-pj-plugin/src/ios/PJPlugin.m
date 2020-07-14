#import "PJPlugin.h"
#import <Cordova/CDVPlugin.h>
#import <UserNotifications/UserNotifications.h>
#import <Photos/Photos.h>
#define SYSTEM_VERSION_LESS_THAN(v)                 ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)

//@Author: ankerasov

@implementation PJPlugin


- (void)pluginInitialize{
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleOpenURLV2:) name:CDVPluginHandleOpenURLWithAppSourceAndAnnotationNotification object:nil];
    
}

// Deep Linking Plugin breaks Other plugins by sending wrong notification. sofix it

-(void)handleOpenURLV2:(NSNotification*) notif{
    
    
    // NSLog(@"HandleNotifWeibo: %@", notif);
    
    NSDictionary *data = [notif object];
    NSURL * url = [data objectForKey:@"url"];

    
    if ([url isKindOfClass:[NSURL class]]) {
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];
    }
    
}
-(void)notificationAuthorizationStatus:(CDVInvokedUrlCommand*)command{
    
    [[UNUserNotificationCenter currentNotificationCenter]  getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings * _Nonnull settings) {
                BOOL authorized =  settings.authorizationStatus == UNAuthorizationStatusAuthorized;
                CDVPluginResult * pluginResult = nil;
                if(authorized){
                    pluginResult =  [CDVPluginResult resultWithStatus : CDVCommandStatus_OK messageAsString:@"authorized"];
                }else{
                     pluginResult =  [CDVPluginResult resultWithStatus : CDVCommandStatus_ERROR messageAsString:@"unauthorized"];
                }
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        
    }];
}
-(void)openAppSettings:(CDVInvokedUrlCommand*)command{
    
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]  options:@{} completionHandler:^(BOOL success) {
            CDVPluginResult* pluginResult = nil;
        
        if (success) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"];
        } else {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"false"];
        }
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } ];
    
}

/**
 *  处理URL
 *
 *  @param notification cordova传递的消息对象
 */
- (void)handleOpenURL:(NSNotification *)notification{
    
    
    
    
}
-(void)saveImage:(CDVInvokedUrlCommand*)command{
    @try {
        [self saveImageChecked:command];
        
    } @catch (NSException *exception) {
        
            CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[exception reason]];;
        
              [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        
    } @finally {
        
    }
}
-(void)saveImageChecked:(CDVInvokedUrlCommand*)command{

   __block  CDVPluginResult * pluginResult = nil;
    
    if (!command.arguments || command.arguments.count == 0) {

                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"no media content selected"];
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        return;
        
    }
    __weak __typeof(self)weakSelf = self;
    
    [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus status) {
        if (status != PHAuthorizationStatusAuthorized) {
            NSLog(@"Photo Library access denied.");
            __typeof(weakSelf) strongSelf = weakSelf;
             // check if self still exists and process accordingly
             if (strongSelf)
             {
      
                 NSString * result = status == PHAuthorizationStatusDenied ? @"PHOTO_ACCESS_DENIED" : @"Cant access to library";
                 
                 pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:result];
                 
                [strongSelf.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
             }
             else
             {
                 // do whatever, if anything, is needed if "self" no longer exists
             }
            
            return;
        }
    }];
    
    NSLog(@"saveImage: %@", [command.arguments objectAtIndex:0]  );
 
    
    NSMutableString *localPathStr =[[command.arguments objectAtIndex:0] firstObject] ;
    
    
    BOOL available = [PHAssetCreationRequest supportsAssetResourceTypes:@[@(PHAssetResourceTypePhoto), @(PHAssetResourceTypePairedVideo)]];
    if (!available) {
        NSLog(@"No permission to save");
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"No permission to save"] ;
                
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        
        return;
    }
    
    NSURL* localPath = [NSURL URLWithString:localPathStr];
    

    [[PHPhotoLibrary sharedPhotoLibrary] performChanges:^{     PHAssetCreationRequest *request = [PHAssetCreationRequest creationRequestForAsset];
        [request addResourceWithType: PHAssetResourceTypePhoto fileURL: localPath options: Nil];
    }
    completionHandler:^(BOOL success, NSError * _Nullable error) {

        __typeof(weakSelf) strongSelf = weakSelf;
                  // check if self still exists and process accordingly
        
        if (success) {
                  pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:@"true"];
              } else {
                  pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"false"];
            }
              
        if (strongSelf) {
                     [strongSelf.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
                }
    }];
}

@end
