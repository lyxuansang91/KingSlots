

cc.Class({
    extends: cc.Component,


    properties: {
        btnOK: cc.Button,
        btnCancel: cc.Button,
        btnClose: cc.Button,
        message: cc.Label,
        type: 0,
        CONFIRM_TYPE: 0,
        MESSAGEBOX_TYPE: 1,
        _callback: function() {}
    },

    closePopup: function() {
        this.node.removeFromParent(true);
    },

    // use this for initialization
    onLoad: function () {

    },
    onCallBack: function() {
        this._callback();
        this.node.removeFromParent(true);
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

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
