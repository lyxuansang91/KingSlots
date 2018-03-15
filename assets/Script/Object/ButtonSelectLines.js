cc.Class({
    extends: cc.Component,

    properties: {
        list_frame: [cc.SpriteFrame],
        number : cc.Label,
        button_line: cc.Button
    },

    onLoad: function () {

    },
    
    initHighLight: function (isHighLight) {
        this.button_line.getComponent(cc.Sprite).spriteFrame =
            isHighLight ? this.list_frame[0] : this.list_frame[1];
    },

    initNumber: function (index) {
        this.number.string = index;
        this.name = index;
    }
});
