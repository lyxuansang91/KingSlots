cc.Class({
    extends: cc.Component,

    properties: {
        item: cc.Sprite,
        list_frame: [cc.SpriteFrame]
    },
    
    init: function (index) {
        this.item.spriteFrame = this.list_frame[index];
    }
});
