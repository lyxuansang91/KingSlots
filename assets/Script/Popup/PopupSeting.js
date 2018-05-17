// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var PopupRight = require("PopupRight");

cc.Class({
    extends: PopupRight,

    properties: {
        itemSetting : cc.Prefab,
        content : cc.Node
    },

    onLoad : function() {
        var list_title = ["Account","Facebook Contact", "Promo Codes",
            "Account Info", "Game Options", "Vibrate","Sound FX"];
        this.list_item = [];

        var containerSize = 0;
        var self = this;
        for(var i = 0; i < list_title.length; i++) {
            var item = cc.instantiate(this.itemSetting);
            var item_comp = item.getComponent("ItemSetting");
            var size = item_comp.node.getContentSize();
            item.setPosition(cc.p(0, this.content.getContentSize().height / 2 + size.height*(-0.5 - i)));
            item_comp.init(list_title[i],i,function (index) {
                self.itemClick(index);
            });

            this.content.addChild(item);

            this.list_item.push(item_comp);

            containerSize += size.height;
        }

        this.content.setContentSize(this.content.width, containerSize > this.content.getContentSize().height ? containerSize : this.content.getContentSize().height);
    },

    itemClick : function (index) {
        console.log("index");
        for(var i = 0; i < this.list_item.length; i++){
            this.list_item[i].bg_highlight.active = (i == index);
        }
    },

    update : function (dt) {

    },
});
