var NetworkManager = require('NetworkManager');
var BaseScene = require('BaseScene');
var PopupMessageBox = require('PopupMessageBox');

cc.Class({
    extends: BaseScene,

    properties: {
        edt_username: cc.EditBox,
        edt_password: cc.EditBox,
        toastPrefab: cc.Prefab,
        messagePopup: cc.Prefab
    },
    // use this for initialization
    onLoad: function () {
        Common.setFingerprint();

        cc.log("ONLOAD LOGIN");
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

        // window.ws.onmessage = this.ongamestatus.bind(this);
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
    handleMessage: function(e) {
        const buffer = e;
        var isDone = this._super(buffer);
        if(isDone) {
            return true;
        }
        isDone = true;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.LOGIN:
                var msg = buffer.response;
                this.handleLoginResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        })
    },
    update: function(dt) {
        this.onGameEvent();
    },

    handleLoginResponseHandler: function(res) {
        cc.log("login response handler:", res);
        if(res.getResponsecode()) {
            var session_id = res.getSessionid();
            cc.log("session id:", session_id);
            Common.setSessionId(session_id);
            Common.setUserInfo(res.getUserinfo().toObject());
            cc.log("get user info:", res.getUserinfo().toObject());
            cc.sys.localStorage.setItem("session_id", session_id);

            cc.sys.localStorage.setItem("user_name",this.edt_username.string);
            cc.sys.localStorage.setItem("user_password",this.edt_password.string);

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

            cc.director.loadScene('Lobby');
        }

        if(res.hasMessage() && res.getMessage() !== "") {
            Common.showPopup(Config.name.POPUP_MESSAGE_BOX,function(message_box) {
                message_box.init(res.getMessage(), 1, function() {
                    cc.log("on callback");
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
                if(res.hasMessage() && res.getMessage() != "") {
                    cc.alert(res.getMessage());
                }
                NetworkManager.closeConnection();
                this.scheduleOnce(this.goIntroScene, 2.0);
            }
        }
    },

    goIntroScene: function(e) {
        cc.director.loadScene('Intro');
    },

    login: function() {
        cc.log("login normal");
        var username = this.edt_username.string;
        var password = this.edt_password.string;

        if(username === "" || password === "") {
            this.showToast(Common.KEYTEXT.BLANK_USERNAME,1);
            return;
        }

        if(Common.isWhiteSpaceText(username)) {
            this.showToast(Common.KEYTEXT.TXT_REMIND2,1);
            return;
        }

        if(username.length < 3 || username.length > 12){
            this.showToast(Common.KEYTEXT.TXT_REMIND4,1);
            return;
        }

        if(username.length < 6 || username.length > 12){
            this.showToast(Common.KEYTEXT.TXT_REMIND5,1);
            return;
        }

        NetworkManager.requestLoginMessage(username, password);
    },

    register: function() {
        cc.director.loadScene('Register');
    },
    loginFacebook: function() {
        window.loginFb(["public_profile"], function(code, response){
            if(code === 0){
                cc.log("login succeeded", response);
                var userID = response.userID;
                var accessToken = response.accessToken;
                console.log(userID,accessToken);
                cc.director.loadScene('Lobby');

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
    },
    showToast: function (strMess, target) {
        this._super(strMess, target);
    }
});
