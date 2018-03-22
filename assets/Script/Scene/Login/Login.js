var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');

cc.Class({
    extends: BaseScene,

    properties: {
        edt_username: cc.EditBox,
        edt_password: cc.EditBox,
        edt_username_register: cc.EditBox,
        edt_pass_register: cc.EditBox,
        edt_repass_register: cc.EditBox,
        edt_displayname_register: cc.EditBox,
        toastPrefab: cc.Prefab,
        messagePopup: cc.Prefab,
        popup_login : cc.Sprite,
        popup_register : cc.Sprite
    },
    // use this for initialization
    onLoad: function () {
        window.jarInfoList = null;
        window.loginSuccess = false;
        Common.setFingerprint();
        this.isLoadScene = false;
        if(cc.sys.isNative)
            sdkbox.PluginFacebook.init();
    },

    start : function () {
        if(this.edt_username != null && this.edt_password != null){
            var user_name_text = cc.sys.localStorage.getItem("user_name");
            var user_pass_text = cc.sys.localStorage.getItem("user_password");
            if(user_name_text != null && user_pass_text != null){
                this.edt_username.string = user_name_text;
                this.edt_password.string = user_pass_text;
            }
        }
    },

    ongamestatus: function(event) {
        if(event.data!==null || typeof(event.data) !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            if(lstMessage.length > 0) {
                var buffer = lstMessage.shift();
                this.handleMessage(buffer);
            }
        }
    },

    assetConfigResponseHandler: function(resp) {
        cc.log("asset config response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.assetsConfigList = [];
            resp.getAssetsList().forEach(function(asset) {
                var obj = {};
                obj.assetid = asset.getAssetid();
                obj.type = asset.getType();
                obj.provider = asset.getProvider();
                obj.parvalue = asset.getParvalue();
                obj.cashvalue = asset.getCashvalue();
                obj.assetname = asset.getAssetname();
                obj.active = asset.getActive();
                obj.minaccountbalance = asset.getMinaccountbalance();
                obj.trustedindex = asset.getTrustedindex();
                Common.assetsConfigList.push(obj);
            });

        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage());
        }
    },

    cardConfigResponseHandler: function(resp) {
        cc.log("card config response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.providerLists = [];
            for(var i = 0; i < resp.getProvidersList().length; i++) {
                var obj = {};
                var provider = resp.getProvidersList()[i];
                obj.providerid = provider.getProviderid();
                obj.providercode = provider.getProvidercode();
                obj.providername = provider.getProvidername();
                obj.productsList = [];
                for(var j = 0; j < provider.getProductsList().length; j++) {
                    var product = provider.getProductsList()[j];
                    var obj_product = {};
                    obj_product.productid = product.getProductid();
                    obj_product.parvalue = product.getParvalue();
                    obj_product.cashvalue = product.getCashvalue();
                    obj_product.description = product.getDescription();
                    obj_product.promotion = product.getPromotion();
                    obj.productsList.push(obj_product);
                }
                Common.providerLists.push(obj);
            }
        }
        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage());
        }
    },
    smsConfigResponseHandler: function(resp) {
        cc.log("sms config response handler:", resp.toObject());

        if(resp.getResponsecode()) {
            Common.smsConfigLists = [];
            for(var i = 0; i < resp.getNumbersList().length; i++) {
                var obj = {};
                var smsNumber = resp.getNumbersList()[i];
                obj.number = smsNumber.getNumber();
                obj.samesyntax = smsNumber.getSamesyntax();
                obj.dayquota = smsNumber.getDayquota();
                obj.providersList = [];
                for(var j = 0; j < smsNumber.getProvidersList().length; j++) {
                    var obj_provider = {};
                    var provider = smsNumber.getProvidersList()[j];
                    obj_provider.providerid = provider.getProviderid();
                    obj_provider.providercode = provider.getProvidercode();
                    obj_provider.providername = provider.getProvidername();
                    obj_provider.syntaxesList = [];
                    for(var k = 0; k < provider.getSyntaxesList().length; k++) {
                        var obj_syntax = {};
                        var syntax = provider.getSyntaxesList()[k];
                        obj_syntax.syntaxid = syntax.getSyntaxid();
                        obj_syntax.syntax = syntax.getSyntax();
                        obj_syntax.parvalue = syntax.getParvalue();
                        obj_syntax.promotion = syntax.getPromotion();
                        obj_syntax.targetnumber = syntax.getTargetnumber();
                        obj_syntax.cashvalue = syntax.getCashvalue();
                        obj_provider.syntaxesList.push(obj_syntax);
                    }
                    obj.providersList.push(obj_provider);
                }
                Common.smsConfigLists.push(obj);
            }
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage());
        }
    },
    jarResponseHandler: function(resp) {
        cc.log("jar response handler:", resp.toObject());

        if(resp.getResponsecode()) {
            if(resp.getJarinfoList().length > 0) {
                // first time request
                window.jarInfoList = resp.getJarinfoList();
            }
        }
    },
    paymentStatusResponseHandler: function(resp) {
        cc.log("payment status response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setEnableCashToGold(resp.getEnablecashtogold());
            Common.setEnableCashTransfer(resp.getEnablecashtransfer());
            Common.setEnableGiftCode(resp.getEnablegiftcode());
            Common.setEnablePurchaseCash(resp.getEnablepurchasecash());
            Common.setEnableTopup(resp.getEnabletopup());
        }
        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.hasMessage(), 2);
        }
    },
    handleMessage: function(e) {
        const buffer = e;
        var isDone = this._super(buffer);
        if(isDone) {
            return true;
        }
        isDone = true;
        var msg = buffer.response;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.LOGIN:
                this.handleLoginResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.REGISTER:
                this.handleRegisterResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.ASSET_CONFIG:
                this.assetConfigResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.CARD_CONFIG:
                this.cardConfigResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.SMS_CONFIG:
                this.smsConfigResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.JAR:
                this.jarResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.PAYMENT_STATUS:
                this.paymentStatusResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },
    checkPurchaseList: function() {
        return (Common.assetsConfigList !== null && Common.smsConfigLists !== null
            && Common.providerLists !== null && window.jarInfoList !== null && window.loginSuccess === true);
    },

    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
        if(this.checkPurchaseList() && !this.isLoadScene) {
            this.isLoadScene = true;
            cc.director.loadScene('Lobby');
        }

    },
    update: function(dt) {
        this.onGameEvent();
    },

    switchLoginToRegister : function () {
        var posXleft = -cc.director.getWinSize().width/2 - this.popup_login.node.getContentSize().width;

        this.popup_login.node.runAction(cc.moveTo(0.5,cc.p(posXleft,0)).easing(cc.easeBackOut()));
        this.popup_register.node.runAction(cc.moveTo(0.2,cc.p(0,0)).easing(cc.easeBackIn()));
    },

    switchRegisterToLogin : function () {
        var posXright= cc.director.getWinSize().width/2 + this.popup_register.node.getContentSize().width;
        this.popup_login.node.runAction(cc.moveTo(0.2,cc.p(0,0)).easing(cc.easeBackIn()));
        this.popup_register.node.runAction(cc.moveTo(0.5,cc.p(posXright,0)).easing(cc.easeBackOut()));
    },

    handleRegisterResponseHandler: function(e) {
        const buffer = e;
        if(buffer.getResponsecode()) {
            NetworkManager.requestLoginMessage(this.edt_username_register.string, this.edt_pass_register.string);
        } else {

            Common.showPopup(Config.name.POPUP_MESSAGE_BOX,function(message_box) {
                message_box.init(buffer.getMessage(), Config.COMMON_POPUP_TYPE.MESSAGE_BOX.CONFIRM_TYPE, function() {
                    cc.log("on callback");
                });
                message_box.appear();
            });
        }
    },

    handleLoginResponseHandler: function(res) {
        cc.log("login response handler:", res.toObject());
        window.loginMessage = null;
        if(res.getResponsecode()) {
            var session_id = res.getSessionid();
            Common.setSessionId(session_id);
            Common.setUserInfo(res.getUserinfo().toObject());
            cc.sys.localStorage.setItem("session_id", session_id);

            cc.sys.localStorage.setItem("user_name",this.edt_username.string);
            cc.sys.localStorage.setItem("user_password",this.edt_password.string);
            window.loginSuccess = true;

            if (res.hasUserinfo()) {
                this.saveUserInfo(res.getUserinfo());
            }
            if (res.hasUsersetting()) {
                this.saveUserSetting(res.getUsersetting());
            }

            if (res.hasEnableevent()) {
                Common.setEnableEvent(res.getEnableevent());
            }

            if (res.hasEnablenotification()) {
                Common.setEnableNotification(res.getEnablenotification());
            }

            if(res.hasEnabletx()){
                Common.setEnableTaixiu(res.getEnabletx());
            }

            if (res.hasNoticetext()){
                Common.setNoticeText(res.getNoticetext());
            }

            if(res.hasMessage() && res.getMessage() !== "") {
                window.loginMessage = res.getMessage();
            }
            // cc.director.loadScene('Lobby');
            if(Common.providerLists === null)
                NetworkManager.getCardConfigRequest(Config.CARD_CONFIG_TYPE.TYPE_CASH);
            if(Common.smsConfigLists === null)
                NetworkManager.requestSmsConfigMessage(1);
            if(Common.assetsConfigList === null) {
                NetworkManager.requestAssetsConfigMessage(1);
            }
            NetworkManager.getJarRequest(0, null);
            return;
        }

        if(res.hasMessage() && res.getMessage() !== "") {
            Common.showPopup(Config.name.POPUP_MESSAGE_BOX,function(message_box) {
                message_box.init(res.getMessage(), Config.COMMON_POPUP_TYPE.MESSAGE_BOX.CONFIRM_TYPE, function() {
                    cc.log("call back");
                });
                message_box.appear();
            });
        }
    },

    handlePingResponseHandler: function(res) {
        cc.log("ping response handler:", res);
        if(res.getResponsecode()) {
            if(res.getDisconnect()) {
                Common.setSessionId("-1");
                if(res.hasMessage() && res.getMessage() !== "") {
                    Common.showToast(res.getMessage());
                }
                NetworkManager.closeConnection();
                this.scheduleOnce(this.goIntroScene, 2.0);
            }
        }
    },
    goIntroScene: function(e) {
        cc.director.loadScene("Intro");
    },

    login: function() {

        var username = this.edt_username.string;
        var password = this.edt_password.string;

        if(username === "" || password === "") {
            Common.showToast(Common.KEYTEXT.BLANK_USERNAME,1);
            return;
        }

        if(Common.isWhiteSpaceText(username)) {
            Common.showToast(Common.KEYTEXT.TXT_REMIND2,1);
            return;
        }

        if(username.length < 3 || username.length > 12){
            Common.showToast(Common.KEYTEXT.TXT_REMIND4,1);
            return;
        }

        if(username.length < 6 || username.length > 12){
            Common.showToast(Common.KEYTEXT.TXT_REMIND5,1);
            return;
        }

        NetworkManager.requestLoginMessage(username, password);
    },

    register: function() {
        if(this.edt_username_register.string === "" || this.edt_pass_register.string === "" ||
            this.edt_repass_register.string === "" || this.edt_displayname_register === "") {
            Common.showToast("Dữ liệu không được để trống");
            return;
        }
        if(this.edt_pass_register.string !== this.edt_repass_register.string) {
            Common.showToast("Mật khẩu phải giống nhau!");
            return;
        }
        NetworkManager.requestRegisterMessage(this.edt_username_register.string, this.edt_pass_register.string,
            this.edt_repass_register.string, this.edt_displayname_register.string, "");
    },

    moveToRegister: function() {
        cc.director.loadScene('Register');
    },
    loginFacebook: function() {
        if(cc.sys.platform === cc.sys.isNative) {
            sdkbox.PluginFacebook.login();
        }else if(cc.sys.isBrowser){
            window.loginFb(["public_profile"], function(code, response){
                if(code === 0){
                    cc.log("login succeeded", response);
                    var userID = response.userID;
                    var accessToken = response.accessToken;
                    console.log(userID,accessToken);

                    if (accessToken !== null) {
                        NetworkManager.getOpenIdLoginMessageFromServer(
                            1, userID + ";" + accessToken, "", "");

                    }else {
                        this.loginFacebook();
                    }

                } else {
                    cc.log("Login failed, error #" + code + ": " + response);
                }
            });
        }
    },
    loginGoogle: function() {
        Common.showPopup(Config.name.POPUP_HISTORY,function(popup) {
            popup.appear();
        });
    },
    saveUserInfo: function(userInfo) {
        Common.setUserName(userInfo.getUsername());
        if (userInfo.hasDisplayname()) {
            Common.setDisplayName(userInfo.getDisplayname());
        }

        if (userInfo.hasLevel()) {
            Common.setLevel(userInfo.getLevel().getLevel());
        }

        if (userInfo.hasCash()) {
            Common.setCash(userInfo.getCash());
        }

        if (userInfo.hasAvatarid()) {
            Common.setAvatarId(userInfo.getAvatarid());
        }

        if (userInfo.hasMobile()){
            Common.setPhoneNunber(userInfo.getMobile());
        }

        if (userInfo.hasAccountverified()){
            Common.setAccountVerify(userInfo.getAccountverified());
        }

        if (userInfo.hasDisablecashtransaction()){
            Common.setDisableCashTransaction(userInfo.getDisablecashtransaction());
        }

        if (userInfo.hasSecuritykeyset()){
            Common.setSecurityKeySeted(userInfo.getSecuritykeyset());
        }
    },
    saveUserSetting: function(userSetting) {
        if (userSetting.hasAutoready()) {
            Common.setAutoReady(userSetting.getAutoready());
            cc.sys.localStorage.setItem("AUTOREADY", userSetting.getAutoready());
        }

        if (userSetting.hasAutodenyinvitation()) {
            Common.setAutoDenyInvitation(userSetting.getAutodenyinvitation());
            cc.sys.localStorage.setItem("DENY_INVITES", userSetting.getAutodenyinvitation());
        }
    }
});
