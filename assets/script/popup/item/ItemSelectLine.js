
cc.Class({
    extends: cc.Component,

    properties: {
        frames_selected : [cc.SpriteFrame],
        frames_deselect : [cc.SpriteFrame],
    },

    init: function(index,callBack){
        this.index = index;
        this.callBack = callBack;
        this.change(true);
        this.isSelect = true;
    },

    change: function (isSelected) {
        this.getComponent(cc.Sprite).spriteFrame = isSelected ?
            this.frames_selected[this.index - 1] : this.frames_deselect[this.index - 1];
    },

    eventTouch : function () {
        this.isSelect = !this.isSelect;
        this.change(this.isSelect);

        this.callBack(this.index);
    }
});
