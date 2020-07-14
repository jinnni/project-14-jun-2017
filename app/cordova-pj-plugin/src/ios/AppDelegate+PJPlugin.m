#import "AppDelegate.h"
#import "PJPlugin.h"
#import "IonicDeeplinkPlugin.h"

static NSString *const DEEP_LINK_PLUGIN = @"IonicDeeplinkPlugin";

@interface AppDelegate (PJPlugin)


- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo;

@end

@implementation AppDelegate (PJPlugin)

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo{

    NSLog(@"Dummy Pj Plugin: %@", userInfo);
    IonicDeeplinkPlugin *plugin = [self.viewController getCommandInstance:DEEP_LINK_PLUGIN];

      if(plugin == nil) {
        NSLog(@"Unable to get instance of command plugin");
        return;
      }

      NSURL *url = [NSURL URLWithString:[userInfo objectForKey:@"uri"]];


      [plugin handleLink:url];
}

@end