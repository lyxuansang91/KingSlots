var Popup = require("Popup");

cc.Class({
    extends: Popup,

    properties: {
        btnOK: cc.Button,
        btnCancel: cc.Button,
        message: cc.Label,
        type: 0,
        CONFIRM_TYPE: 0,
        MESSAGEBOX_TYPE: 1,
        _callback: function() {}
    },

    onLoad: function () {

    },

    closePopup : function () {
        this.disappear(Config.name.COMMON_POPUP);
    },

    onCallBack: function() {
        this._callback();
        this.disappear(Config.name.COMMON_POPUP);
    },

    init: function(msg, type, callback) {
        this.message.string = msg;
        switch (type) {
            case 0:
                this.btnCancel.node.active = false;
                this.btnOK.node.active = true;
                this.btnOK.node.setPositionX(0);
                break;
            case 1:
                this.btnCancel.node.active = true;
                this.btnOK.node.active = true;
                this.btnOK.node.setPositionX(-83.0);
                break;
            case 2:
                break;
            default:
                break;
        }
        this._callback = callback;
    }
});
