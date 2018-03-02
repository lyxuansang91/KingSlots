cc.Class({
    extends: cc.Component,

    properties: {
        lbl_body: cc.RichText,
        bg_toast: cc.Sprite,
        maxWidth: 36
    },

    loadMessage: function (message,delay) {
        var self = this;

        cc.log("DELAY : ",delay);

        var callFunc = cc.callFunc(function(){
            /*var scene = cc.director.getScene();
            if(cc.isValid(scene.getChildByName("Toast"))){
                scene.getChildByName("Toast").destroy();
            }*/
        },this);

        self.node.stopAllActions();
        self.node.setOpacity(0);
        var action = cc.sequence(cc.fadeIn(0.1),cc.delayTime(delay),cc.fadeOut(0.5));
        self.node.runAction(action);

        if(message.length > this.maxWidth){
            self.lbl_body.string = Common.wordWrap(message,this.maxWidth);
            self.bg_toast.node.setContentSize(cc.size(self.lbl_body.node.getContentSize().width*1.09,
                self.lbl_body.node.getBoundingBox().height*1.35));
        }else{
            self.lbl_body.string = message;
            self.bg_toast.node.setContentSize(cc.size(self.lbl_body.node.getContentSize().width*1.15 *
                        message.length / this.maxWidth,
                        self.lbl_body.node.getBoundingBox().height*1.8));
        }
    }
});
