cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Button
        },
        avatarSprite: cc.Prefab,
    },

    init: function (index, crrAvatarId, callback) {
        cc.log("crrAvatarId =", crrAvatarId);
        this.callback = callback;
        this.tag = index;

        var avatarId = index;
        if(index === crrAvatarId - 100000){
            cc.log("crrAvatarId =", crrAvatarId);
            this.node.setLocalZOrder(2);
            this.node.setScale(1.1,1.1);
        }
        var item = cc.instantiate(this.avatarSprite);
        var avaSprite = item.getComponent("AvatarSprite").init(avatarId);

        this.background.getComponent(cc.Sprite).spriteFrame = avaSprite;

    },

    buttonEvent: function () {
        this.callback(this.tag);
        this.node.setLocalZOrder(2);
        this.node.setScale(1.1,1.1);
    },


});
