cc.Class({
    extends: cc.Component,

    properties: {
        lbl_body: cc.RichText,
        bg_toast: cc.Sprite
    },

    onLoad: function () {
        var self = this;

        var callFunc = cc.callFunc(function(){
            var scene = cc.director.getScene();
            if(cc.isValid(scene.getChildByName("Toast"))){
                scene.getChildByName("Toast").destroy();
            }
        },this);
        var action = cc.sequence(cc.fadeIn(0.1),
            cc.delayTime(1.0),cc.FadeOut(1.0),callFunc);
        self.node.runAction(action);
    },

    loadMessage: function (message) {
        var self = this;

        self.lbl_body.string = Common.wordWrap(message,36);
        self.bg_toast.node.setContentSize(cc.size(self.bg_toast.spriteFrame.getRect().width,
            self.lbl_body.node.getBoundingBox().height*1.35));
    }
});
