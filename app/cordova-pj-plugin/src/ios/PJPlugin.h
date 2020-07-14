#import <Cordova/CDVPlugin.h>

@interface PJPlugin : CDVPlugin{
    
}

-(void)notificationAuthorizationStatus:(CDVInvokedUrlCommand*)command;
-(void)openAppSettings:(CDVInvokedUrlCommand*)command;
-(void)saveImage:(CDVInvokedUrlCommand*)command;

@end
