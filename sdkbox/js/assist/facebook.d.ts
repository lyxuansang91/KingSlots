declare module sdkbox {     module FBGraphUser {        export function FBGraphUser() : object;
        export function FBGraphUser(json : object) : object;
        export function FBGraphUser(json : string) : object;
        export function getUserId() : string;
        export function getName() : string;
        export function getFirstName() : string;
        export function getLastName() : string;
        export function getEmail() : string;
        export function getPictureURL() : string;
        export function isAppInstalled() : boolean;
        export function isPictureSilhouette() : boolean;
        export function asBoolean(param : object) : boolean;
        export function getField(field : string) : string;
        export function setField(field : string , value : string) : object;
        /**        * the bool value will be converted to 'true' (kGU_STR_TRUE) or 'false' (kGU_STR_FALSE)        */        export function setField(field : string , value : boolean) : object;
        export function toJSON() : object;
        export function toJSONString() : string;
        export function getFields() : object;
    }     module PluginFacebook {        /*!        * initialize the plugin instance.        */        export function init() : object;
        /**        * Set listener to listen for facebook events        */        export function setListener(listener : object) : object;
        /**        * Get the listener        */        export function getListener() : object;
        /**        * Remove the listener, and can't listen to events anymore        */        export function removeListener() : object;
        /**        * @brief login        *        */        export function setLoginBehavior(loginBehavior : number) : object;
        /**        * @brief log in        *        * This method calls login with a single permission: sdkbox::FB_PERM_READ_PUBLIC_PROFILE        */        export function login() : object;
        export function login(permissions : object) : object;
        /**        * @brief log in with specific read permissions, conflict with publish permissions        * https://developers.facebook.com/docs/facebook-login/permissions        *        * @param read permissions        */        export function requestReadPermissions(permissions : object) : object;
        /**        * @brief log in with specific public permissions        * https://developers.facebook.com/docs/facebook-login/permissions        *        * @param publish permissions        */        export function requestPublishPermissions(permissions : object) : object;
        /**        * @brief log out        */        export function logout() : object;
        /**        * @brief Check whether the user logined or not        */        export function isLoggedIn() : boolean;
        /**        * @brief get UserID        */        export function getUserID() : string;
        /**        * @brief get AccessToken        */        export function getAccessToken() : string;
        /**        * @brief get permissoin list        */        export function getPermissionList() : object;
        /**        * @brief share        *        * @param info share information        */        export function share(info : object) : object;
        /**        * @brief open a dialog of Facebook app or WebDialog (dialog with photo only avaible with native Facebook app)        *        * @param info share information        */        export function dialog(info : object) : object;
        /**        * @brief return the version of Facebook SDK        */        export function getSDKVersion() : string;
        /**        * @brief use Facebook Open Graph api        * https://developers.facebook.com/docs/ios/graph        *        * @param path path of Open Graph api        * @param method HttpMethod ["GET","POST","DELETE"]        * @param params request parameters        * @param cb callback of request        */        export function api(path : string , method : string , params : object , tag : string) : object;
        /**        * @brief fetch friends data from Facebook        *        * This data only reflects your friends that are using the app.        * The number of friends defaults to 25.        */        export function fetchFriends() : object;
        /**        * @brief get friends info        */        export function getFriends() : object;
        /**        * @brief check whether can present Facebook App        */        export function canPresentWithFBApp(info : object) : boolean;
        /**        * Get a vector of invitable friends info which can be used to build a custom friends invite dialog.        *        * The default set will be limited to 25 friends.        * The order in which FB sorts the friends, and which ones returns vary between calls.        * The returned invitation tokens are not supposed to be long-term stored and may vary between        * calls for the same friends.        *        * The application must have a canvas configuration for this API call to work.        *        */        export function requestInvitableFriends(param : object) : object;
        /**        * Invite friends based on the result obtained from a call to <code>requestInvitableFriends</code>        */        export function inviteFriendsWithInviteIds(invite_ids : object , title : string , invite_text : string) : object;
        /**        * Use the default FB dialog to invite friends.        */        export function inviteFriends(app_link_url : string , preview_image_url : string) : object;
        /**        * Set the Facebook App ID to be used by the FB SDK.        */        export function setAppId(appId : string) : object;
        /**        * Set the app url scheme suffix used by the FB SDK.        */        export function setAppURLSchemeSuffix(appURLSchemeSuffix : string) : object;
        /**        * Ask friends for a gift        */        export function requestGift(invite_ids : object , object_id : string , message : string , title : string , additional_data : string) : object;
        /**        * Send friend a gift        */        export function sendGift(friend_ids : object , object_id : string , title : string , message : string , additional_data : string) : object;
        /**        * Log event        */        export function logEvent(eventName : string) : object;
        /**        * Log event with value        */        export function logEvent(eventName : string , valueToSum : number) : object;
        /**        * Log purchase event        */        export function logPurchase(mount : number , currency : string) : object;
    }     module FacebookListener {        export function onLogin(isLogin : boolean , msg : string) : object;
        export function onSharedSuccess(message : string) : object;
        export function onSharedFailed(message : string) : object;
        export function onSharedCancel() : object;
        export function onAPI(key : string , jsonData : string) : object;
        export function onPermission(isLogin : boolean , msg : string) : object;
        export function onFetchFriends(ok : boolean , msg : string) : object;
        export function onRequestInvitableFriends(friends : object) : object;
        export function onInviteFriendsWithInviteIdsResult(result : boolean , msg : string) : object;
        export function onInviteFriendsResult(result : boolean , msg : string) : object;
        export function onGetUserInfo(userInfo : object) : object;
        export function onRequestGiftResult(result : boolean , msg : string) : object;
        export function onSendGiftResult(result : boolean , msg : string) : object;
    }     module FBShareInfo {        export function FBShareInfo() : object;
    }     module FBInvitableUsersCursor {        export function FBInvitableUsersCursor(json : object) : object;
        export function FBInvitableUsersCursor() : object;
    }     module FBInvitableFriendsInfo {        export function FBInvitableFriendsInfo(json : string) : object;
        export function init() : object;
        export function getNumInvitationTokens() : object;
        export function begin() : object;
        export function begin() : object;
        export function end() : object;
        export function end() : object;
        export function getOriginalString() : string;
        /**        * Request this url to get the next invitable friends document info.        * Maybe empty.        */        export function getNextURL() : string;
        /**        * Request this url to get the prev invitable friends document info.        * Maybe empty;        */        export function getPrevURL() : string;
        /**        * Use this string to build the NextURL.        */        export function getNextCursor() : string;
        /**        * Use this string to build the PrevURL.        */        export function getPrevCursor() : string;
    }}