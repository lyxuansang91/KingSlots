cc.Class({
    extends: cc.Component,

    properties: {
        item: cc.Sprite,
        list_frame: [cc.SpriteFrame]
    },
    
    init: function (index) {
        this.item.spriteFrame = this.list_frame[index];
    },

    animate: function () {
        var scale = cc.scaleTo(0.5,1.1);
        var rotate1 = cc.rotateTo(0.2,-30);
        var rotate2 = cc.rotateTo(0.2,30);
        var rotate3 = cc.rotateTo(0.1,0);
        this.node.runAction(scale);
        this.node.runAction(cc.repeat(cc.sequence(rotate1,rotate2,rotate3),5));
    },

    reset: function () {
        this.node.setScale(1);
        //this.node.setRotate(0);
        this.node.stopAllActions();
    }
});
