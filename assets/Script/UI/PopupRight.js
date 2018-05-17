cc.Class({
    extends: cc.Component,

    properties: {
        bg_dark: cc.Sprite,
        background: cc.Sprite,
        exit: cc.Button
    },

    onLoad: function () {
        function onTouchDown (event) {
            return true;
        }

        this.node.on('touchstart', onTouchDown, this.bg_dark);
    },

    handleTouchOutSide: function () {
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

        this.node.on('touchstart', onTouchDown, this.background);
    },

    setNamePopup: function (name) {
        this.name = name;
    },

    appear:function () {
        var self = this;
        this.bg_dark.node.runAction(cc.fadeTo(0.15,150));

        var action = cc.moveTo(0.2,cc.p(cc.director.getVisibleSize().width/2 -
            this.background.node.width/2,0)).easing(cc.easeSineIn());
        this.background.node.runAction(cc.sequence(action,cc.callFunc(function () {
            self.handleTouchOutSide();
        })));
    },

    disappear: function () {
        var name = this.name;
        var callDisappear = cc.callFunc(function(){
            Common.closePopup(name);
        },this);

        this.bg_dark.node.runAction(cc.fadeOut(0.1));
        var move = cc.moveTo(0.35,cc.p(Common.width,0)).easing(cc.easeSineOut());
        this.background.node.runAction(cc.sequence(move,callDisappear));
    }
});
