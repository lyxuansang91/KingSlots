cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        background: cc.Sprite,
        close: cc.Sprite,
        exit: cc.Sprite,
        lblExit: cc.Label
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    disappear:function () {
        var callDisappear = cc.callFunc(function(){
            this.node.removeFromParent(true);
        },this);

        var move = cc.moveTo(0.05,cc.p(0,-200));
        this.background.node.runAction(cc.sequence(move,callDisappear));
    },

    appear:function () {
        cc.log("aaaaaaaaaaaa");
        // cc.log("call", this);
        // this.visible = true;
        // cc.eventManager.addListener({
        //     event: cc.EventListener.TOUCH_ONE_BY_ONE,
        //     swallowTouches: true ,
        //     onTouchBegan: function(touch ,event) {
        //         var target = event.getCurrentTarget();
        //
        //         var locationInNode = target.convertToNodeSpace(touch.getLocation());
        //
        //         var s = target.getContentSize();
        //         var rect = cc.rect(0, 0, s.width, s.height);
        //
        //         //Check the click area
        //         if (!cc.rectContainsPoint(rect,locationInNode)){
        //             this.disappear();
        //             return true;
        //         }
        //         return false;
        //     },
        // },this);
        //
        // this.runAction(cc.sequence(cc.moveTo(0.1,cc.p(0.5,0.5)),cc.callFunc(function(){
        //     this.runAction(cc.sequence(cc.fadeTo(0.1,200),cc.callFunc(function () {
        //         this.scheduleUpdate();
        //     },this)));
        // },this)));
        // var self = this;
        // self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        // self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        // function onTouchDown (event) {
        //     this.stopAllActions();
        //     this.runAction(self.scaleDownAction);
        // }
        // function onTouchUp (event) {
        //     this.stopAllActions();
        //     this.runAction(self.scaleUpAction);
        // }
        // this.node.on('touchstart', onTouchDown, this.node);
        // this.node.on('touchend', onTouchUp, this.node);
        // this.node.on('touchcancel', onTouchUp, this.node);
    }
});
