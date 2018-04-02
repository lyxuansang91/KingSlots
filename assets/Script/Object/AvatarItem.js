cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Button
        },
        avatarSprite: cc.Prefab,
        bg_dark: cc.Sprite
    },

    init: function (index, crrAvatarId, callback) {
        cc.log("crrAvatarId =", crrAvatarId);
        this.callback = callback;
        this.tag = index;

        var avatarId = index;
        if(index === crrAvatarId - 100000){
            // cc.log("crrAvatarId =", crrAvatarId);
            // this.node.setLocalZOrder(2);
            // this.node.setScale(1.1,1.1);
            this.invisibleDark();
        }
        var item = cc.instantiate(this.avatarSprite);
        var avaSprite = item.getComponent("AvatarSprite").init(avatarId);

        this.background.getComponent(cc.Sprite).spriteFrame = avaSprite;

    },

    buttonEvent: function () {
        this.callback(this.tag);
        // this.node.setLocalZOrder(2);
        // this.node.setScale(1.1,1.1);
        this.invisibleDark();
    },

    invisibleDark: function () {
        this.bg_dark.node.active = false;
    },

    visibleDark: function () {
        this.bg_dark.node.active = true;
    }


});
