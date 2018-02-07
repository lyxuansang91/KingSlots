cc.Class({
    extends: cc.Component,

    properties: {
        list_frame: [cc.SpriteFrame],
        number : cc.Label
    },

    onLoad: function () {

    },
    
    initHighLight: function () {
        this.getComponent(cc.Sprite).spriteFrame = this.list_frame[1];
    },

    initNormal: function () {
        this.getComponent(cc.Sprite).spriteFrame = this.list_frame[0];
    },

    initNumber: function (index) {
        cc.log("number : ",index);
        this.number.string = index;
    }
});
