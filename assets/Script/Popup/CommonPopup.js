cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        btnOK: cc.Button,
        btnCancel: cc.Button,
        btnClose: cc.Button,
        message: cc.Label,
        type: 0,
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
    },

    init: function(msg, type, callback) {
        this.message.string = msg;
        switch (type) {
            case 0:
                break;
            case 1:
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
