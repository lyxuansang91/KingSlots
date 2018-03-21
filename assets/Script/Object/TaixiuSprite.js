cc.Class({
    extends: cc.Component,

    properties: {
        list_frame: [cc.SpriteFrame],
        background: cc.Sprite
    },

    init: function (result) {
        if(result > 10){
            this.background.spriteFrame = this.list_frame[1];
        } else {
            this.background.spriteFrame = this.list_frame[0];
        }

    },
});
