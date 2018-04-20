cc.Class({
    extends: cc.Component,

    properties: {
        avatar: cc.Sprite,
        displayName: cc.Label,
        txt_level: cc.Label,
        txt_id: cc.Label,
        txt_phone: cc.Label,
        txt_chiso: cc.Label,
        txt_sovanchoi: cc.Label,
        txt_sovanthang: cc.Label,
        txt_sovanthua: cc.Label,
        avatarSprite: cc.Prefab,
        txt_money: cc.Label,
        avatarImage : cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {

    },
    init: function (avatar, displayName, level, id, phone, chiso, sovanchoi, sovanthang, sovanthua, cash) {
        this.displayName.string = displayName;
        this.txt_level.string = level;
        this.txt_id.string = id;
        this.txt_phone.string = phone;
        this.txt_chiso.string = chiso;
        this.txt_sovanchoi.string = sovanchoi;
        this.txt_sovanthang.string = sovanthang;
        this.txt_sovanthua.string = sovanthua;
        this.txt_money.string = cash;

        var avatarId = Common.getAvatarId() - 100000;

        var item = cc.instantiate(this.avatarSprite);

        var avaSprite = item.getComponent("AvatarSprite").init(avatarId);

        this.avatar.getComponent(cc.Sprite).spriteFrame = avaSprite;
        this.avatar.node.setScale(2);
    },

    updateInfo: function (avatar, phone) {

        if(avatar !== null){
            var avatarId = avatar - 100000;

            var item = cc.instantiate(this.avatarSprite);
            var avaSprite = item.getComponent("AvatarSprite").init(avatarId);

            this.node.getChildByName('sanh_avatar_demo').getComponent(cc.Sprite).spriteFrame = avaSprite;
        }

        if(phone !== null){
            this.node.getChildByName('txt_phone').getComponent(cc.Label).string = phone;
        }

    },

    openChangePass: function () {
        Common.showPopup(Config.name.POPUP_CHANGE_PASS,function(popup) {
            popup.appear();
        });
    },

    openChangeAvatar: function () {
        Common.showPopup(Config.name.POPUP_CHANGE_AVATAR,function(popup) {
            popup.appear();
        });
    },

    openChangeInfo: function () {
        Common.showPopup(Config.name.POPUP_CHANGE_INFO,function(popup) {
            popup.appear();
        });
    },

    connectFacebook: function () {
        Common.openIdConnectRequest(Common.FACEBOOK_CHANNEL);
    }

});
