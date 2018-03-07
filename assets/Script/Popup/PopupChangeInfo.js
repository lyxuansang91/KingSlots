var Popup = require('Popup');
var NetworkManager = require('NetworkManager');
cc.Class({
    extends: Popup,

    properties: {
        phone: cc.EditBox
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
                this.changeInfoHander(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },

    changeInfoEvent: function () {
        var phone = this.phone.string;

        if (phone === ""){
            Common.showToast(Common.KEYTEXT.BLANK_USERNAME);
            return;
        }

        if (phone.length > Config.Valid.MAX_LENGTH_SDT){
            Common.showToast(Common.KEYTEXT.INVALID_PHONE);
            return;
        }

        var edit_info = new proto.BINEditingInfo();

        edit_info.setInfofield(Config.Update.UPDATE_PHONE);
        edit_info.setNewvalue(phone);
        Common.setNewPhone(phone);
        NetworkManager.getUpdateUserInfoMessageFromServer(edit_info, 1);

    },


    changeInfoHander: function (response) {
        cc.log("response changepass =", response);
        if(response.getResponsecode()){
            Common.showToast(response.getMessage());
            this.disappear();
        } else {
            Common.showToast(response.getMessage());
        }

    }
});