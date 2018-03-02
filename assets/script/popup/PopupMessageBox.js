var Popup = require("Popup");

cc.Class({
    extends: Popup,

    properties: {
        btnOK: cc.Button,
        btnCancel: cc.Button,
        message: cc.Label,
        type: 0,
        _callback: function() {}
    },

    onLoad: function () {

    },

    onCallBack: function() {
        this._callback();
        this.disappear();
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
