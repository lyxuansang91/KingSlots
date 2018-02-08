cc.Class({
    extends: cc.Component,

    properties: {
        list_frames: [cc.SpriteFrame]
    },

    init: function (index) {
        this.getComponent(cc.Sprite).spriteFrame = this.list_frames[index];
    },

    animate: function () {
        var fade1 = cc.fadeTo(1,100);
        var fade2 = cc.fadeTo(1,255);
        this.node.runAction(cc.repeatForever(cc.sequence(fade1,fade2)));
    },

    reset: function () {
        this.node.stopAllActions();
    }
});
