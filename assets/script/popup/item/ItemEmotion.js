
cc.Class({
    extends: cc.Component,

    properties: {
        icon_emotions : [cc.SpriteFrame],
    },

    init: function(index){
        this.index = index;
        this.getComponent(cc.Sprite).spriteFrame = this.icon_emotions[index - 1];
    },

    addTouch : function (callBack) {
        this.callBack = callBack;
        this.enableTouch = true;
    },
    
    eventTouch : function () {
        if(this.enableTouch){
            this.callBack(this.index);
        }
    }
});
