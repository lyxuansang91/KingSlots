cc.Class({
    extends: cc.Component,

    properties: {
        list_frames: [cc.SpriteFrame]
    },

    init: function (index) {
        this.getComponent(cc.Sprite).spriteFrame = this.list_frames[index];
    },

    animate: function () {
        var fade1 = cc.fadeTo(0.5,50);
        var fade2 = cc.fadeTo(0.5,255);
        this.node.runAction(cc.repeat(cc.sequence(fade1,fade2),6));
    },

    show: function (isShow) {
        this.node.setOpacity(isShow ? 255 : 0);
    },

    reset: function () {
        this.node.stopAllActions();
        this.node.setOpacity(0);
    }
});
