var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        item_normal: cc.Sprite,
        item_zoom: cc.Sprite,
        list_frame_item : [cc.SpriteFrame],
        list_frame_item_clicked : [cc.SpriteFrame],
    },

    init: function (index,callback) {
        this.index = index;
        this.item_normal.spriteFrame = this.list_frame_item[index];
        this.item_zoom.spriteFrame = this.list_frame_item_clicked[index];
        this.callback = callback;
    },

    hoverEvent : function (callback_hover) {
        this.callback_hover = callback_hover;
        var self = this;

        this.node.on('mouseenter', function ( event ) {
            self.node.setLocalZOrder(2);
            self.zoom(true);
            self.callback_hover(self.index,true);
        });
        this.node.on('mouseleave', function ( event ) {
            self.node.setLocalZOrder(1);
            self.zoom(false);
            self.callback_hover(self.index,false);
        });
    },

    itemClick: function () {
        if(window.loginSuccess === null || !window.loginSuccess) {
            Common.showToast("Bạn vui lòng đăng nhập để chơi game!");
            return;
        } else {

        }
        this.callback(this.index);
        this.node.setLocalZOrder(2);
        this.zoom(true);

    },

    zoom: function (isZoom) {
        var self = this;

        var callFunc = cc.callFunc(function () {
            self.item_normal.node.active = !isZoom;
            self.item_zoom.node.active = isZoom;
        });
        if(!isZoom){
            this.node.setLocalZOrder(1);
            this.item_zoom.node.runAction(cc.sequence(cc.scaleTo(0.2,1),callFunc));
        }else{
            // var callFuncDone = cc.callFunc(function () {
            //     self.light.getComponent(cc.Animation).play("light_item_move");//.repeatCount = 2;
            // });

            // self.item_normal.node.active = !isZoom;
            // self.item_zoom.node.active = isZoom;
            // this.item_zoom.node.runAction(cc.sequence(cc.scaleTo(0.2,1.155),callFuncDone));
        }
    },

});
