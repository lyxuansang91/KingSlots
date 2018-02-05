cc.Class({
    extends: cc.Component,

    properties: {
        angel: 360,
        duration: 1.0,
        darkSprite: cc.Sprite,
        loading : cc.Sprite
    },

    onLoad: function () {
        var self = this;
        var action = cc.repeatForever(cc.rotateBy(this.duration,this.angel));
        self.loading.node.runAction(action);
    }
});
