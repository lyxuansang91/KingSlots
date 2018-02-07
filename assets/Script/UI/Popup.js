cc.Class({
    extends: cc.Component,

    properties: {
        bg_dark: cc.Sprite,
        background: cc.Sprite,
        exit: cc.Button
    },

    // use this for initialization
    onLoad: function () {
        function onTouchDown (event) {
            return true;
        }

        this.node.on('touchstart', onTouchDown, this.bg_dark);
    },

    disappear:function () {
        var name = this.name;
        var callDisappear = cc.callFunc(function(){
            Common.closePopup(name);
        },this);

        this.bg_dark.node.runAction(cc.fadeOut(0.1));
        var move = cc.scaleTo(0.15,0.5).easing(cc.easeBackIn());
        var fade = cc.fadeOut(0.15);
        var action = cc.spawn(move,fade);
        this.background.node.runAction(cc.sequence(action,callDisappear));
    },

    setNamePopup: function (name) {
        this.name = name;
    },

    appear:function () {
        cc.log("appear popup");
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

        this.bg_dark.node.runAction(cc.fadeTo(0.15,150));

        this.background.node.setScale(0.7);

        var action = cc.scaleTo(0.2,1).easing(cc.easeBackOut());
        this.background.node.runAction(cc.sequence(action,cc.callFunc(function(){
            //this.background.node.runAction(cc.sequence(cc.scaleTo(0.1,0.9),action.clone()));
        },this)));
    }
});
