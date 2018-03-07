var Popup = require('Popup');
var NetworkManager = require('NetworkManager');
cc.Class({
    extends: Popup,

    properties: {
        oldPass: cc.EditBox,
        newPass: cc.EditBox,
        renewPass: cc.EditBox
    },

    onLoad : function () {

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

    handleMessage: function(e) {
        const buffer = e;
        var isDone = true;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.UPDATE_USER_INFO:
                var msg = buffer.response;
                this.changePassHander(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    changePassEvent: function () {
        var oldPass = this.oldPass.string;
        var newPass = this.newPass.string;
        var renewPass = this.renewPass.string;

        if (oldPass === "" || newPass === "" || renewPass === ""){
            Common.showToast(Common.KEYTEXT.BLANK_USERNAME);
            return;
        }
        if (newPass !== renewPass) {
            Common.showToast(Common.KEYTEXT.PASSWORD_NOT_MATCH);
            return;
        }
        if (oldPass === newPass) {
            Common.showToast(Common.KEYTEXT.PASSWORD_NOT_CHANGE);
            return;

        }

        if (newPass.length < Config.Valid.MIN_LENGTH_PASSWORD || newPass.length > Config.Valid.MAX_LENGTH_PASSWORD){
            Common.showToast(Common.KEYTEXT.INVALID_PASSWORD);
            return;
        }

        var edit_info = new proto.BINEditingInfo();

        edit_info.setInfofield(Config.Update.UPDATE_PASSWORD);
        edit_info.setOldvalue(oldPass);
        edit_info.setNewvalue(newPass);
        edit_info.setConfirmvalue(renewPass);
        NetworkManager.getUpdateUserInfoMessageFromServer(edit_info, 1);

    },


    changePassHander: function (response) {
        cc.log("response changepass =", response);
        if(response.getResponsecode()){
            Common.showToast(response.getMessage());
            this.disappear();
        } else {
            Common.showToast(response.getMessage());
        }

    }
});