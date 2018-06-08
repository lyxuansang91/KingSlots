cc.Class({
    extends: cc.Component,

    properties: {
        list_frame: [cc.SpriteFrame],
        list_frame_h: [cc.SpriteFrame],
        number : cc.Label
    },

    initResult: function (isTai) {
        this.node.getChildByName("sprite").getComponent(cc.Sprite).spriteFrame =
            isTai ? this.list_frame[0] : this.list_frame[1];
    },

    highLight: function(isTai){
        this.node.getChildByName("high_light").active = true;
        this.node.getChildByName("high_light").getComponent(cc.Sprite).spriteFrame =
            isTai ? this.list_frame_h[0] : this.list_frame_h[1];
        this.node.runAction(cc.repeatForever(cc.sequence(cc.moveBy(0.5,cc.p(0,25)),cc.moveBy(0.5,cc.p(0,-25)))));
    },

    initNumber: function (index) {
        cc.log("number : ",index);
        this.number.string = index;
    }
});