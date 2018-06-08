var NetworkManager = require('NetworkManager');
var Popup = require('Popup');

cc.Class({
    extends: Popup,

    properties: {
        edt_username_register: cc.EditBox,
        edt_pass_register: cc.EditBox,
        edt_repass_register: cc.EditBox,
        edt_displayname_register: cc.EditBox,
    },

    onLoad: function () {
        
    },

    register: function() {
        cc.log("register");
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

    update: function(dt) {
        this.onGameEvent();
    },

    onGameEvent: function() {
        var self = this;
        NetworkManager.checkEvent(function(buffer) {
            return self.handleMessage(buffer);
        });
    },

    handleMessage: function(e) {
        const buffer = e;
        var isDone = true;
        var msg = buffer.response;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.REGISTER:
                this.handleRegisterResponseHandler(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    handleRegisterResponseHandler: function(e) {
        cc.log("handleRegisterResponseHandler =", e);
        const buffer = e;
        if(buffer.getResponsecode()) {
            this.disappear();
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
});
