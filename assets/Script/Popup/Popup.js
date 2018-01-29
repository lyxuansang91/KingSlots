cc.Class({
    extends: cc.Component,

    properties: {
        dark_sprite: cc.Sprite,
        background: cc.Sprite,
        close: cc.Sprite,
        exit: cc.Sprite,
        lblExit: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        function onTouchDown (event) {
            return true;
        }

        this.node.on('touchstart', onTouchDown, this.dark_sprite);
    },

    disappear:function () {
        var callDisappear = cc.callFunc(function(){
            this.node.removeFromParent(true);
        },this);

        this.dark_sprite.node.runAction(cc.fadeOut(0.1));
        var move = cc.scaleTo(0.15,0.5).easing(cc.easeBackIn());
        this.background.node.runAction(cc.sequence(move,callDisappear));
    },

    appear:function () {
        this.visible = true;

        var background = this.background;
        var self = this;

        function onTouchDown (touch,event) {

            var locationInNode = background.node.convertToNodeSpace(touch.getLocation());

            var rect = background.spriteFrame.getRect();

            if (!cc.rectContainsPoint(rect,locationInNode)){
                self.disappear();
                return true;
            }
            return false;
        }

        this.node.on('touchstart', onTouchDown, background);

        this.dark_sprite.node.runAction(cc.fadeTo(0.15,150));

        this.background.node.setScale(0.7);

        var action = cc.scaleTo(0.2,1).easing(cc.easeBackOut());
        this.background.node.runAction(cc.sequence(action,cc.callFunc(function(){
            //this.background.node.runAction(cc.sequence(cc.scaleTo(0.1,0.9),action.clone()));
        },this)));
    }
});
