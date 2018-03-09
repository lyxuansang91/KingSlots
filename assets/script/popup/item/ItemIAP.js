
cc.Class({
    extends: cc.Component,

    properties: {
        lbl_money : cc.Label,
        items : [cc.SpriteFrame]
    },

    onLoad: function () {

    },

    start: function () {

    },

    init: function (money,index) {
        this.lbl_money.string = money;
        this.node.getComponent(cc.Sprite).spriteFrame = this.items[index];
    }
});
