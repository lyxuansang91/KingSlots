cc.Class({
    extends: cc.Component,

    properties: {
        bg_toast: {
            default: null,
            type: cc.Sprite
        },
        lbl_toast: {
            default: null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    showToast: function (strMess) {
        cc.log("strMess =", strMess);
        this.bg_toast.node.active = true;
        this.lbl_toast.node.active = true;
        this.lbl_toast.string = strMess;
    },

    closeToast: function () {
        this.bg_toast.node.active = false;
        this.lbl_toast.node.active = false;
    }
});
