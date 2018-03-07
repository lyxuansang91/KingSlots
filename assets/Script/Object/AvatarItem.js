var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Button
        },
        list_frame: [cc.SpriteFrame]
    },

    init: function (index, callback) {
        this.callback = callback;
        this.tag = index;
        this.background.getComponent(cc.Sprite).spriteFrame = this.list_frame[index];
    },


    buttonEvent: function (e) {
        this.callback(this.tag);
    }

});
