cc.Class({
    extends: cc.Component,

    properties: {
        list_frame: [cc.SpriteFrame],
        number : cc.Label
    },

    initResult: function (isTai) {
        this.node.getComponent(cc.Sprite).spriteFrame =
            isTai ? this.list_frame[0] : this.list_frame[1];
    },

    initNumber: function (index) {
        cc.log("number : ",index);
        this.number.string = index;
    }
});