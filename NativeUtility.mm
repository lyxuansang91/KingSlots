//
//  Nativex.m
//  KingSlots-mobile
//
//  Created by HungLe on 1/30/18.
//

#import <Foundation/Foundation.h>

@interface NativeUtility : NSObject
+(NSString*)getDeviceID;
+(NSString*)getPackageName;
@end

@implementation NativeUtility

+(NSString*)getDeviceID{
    NSString *deviceId = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    NSLog(@"deviceID :%@",deviceId);
    return deviceId;
}

+(NSString*)getPackageName{
    NSString *bundleId = [[NSBundle mainBundle] bundleIdentifier];
    NSLog(@"Bundle :%@",bundleId);
    return bundleId;
}
@end
