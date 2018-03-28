var NetworkManager = require('NetworkManager');

cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Button
        },
        avatarSprite: cc.Prefab,
    },

    init: function (index, callback) {
        this.callback = callback;
        this.tag = index;

        var avatarId = index;

        var item = cc.instantiate(this.avatarSprite);
        var avaSprite = item.getComponent("AvatarSprite").init(avatarId);

        this.background.getComponent(cc.Sprite).spriteFrame = avaSprite;

    },

    buttonEvent: function (e) {
        this.callback(this.tag);
    },


});
