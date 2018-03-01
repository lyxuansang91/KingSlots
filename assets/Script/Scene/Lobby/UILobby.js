var MAIL_RECEIVED = 1;
var MAIL_SENT = 2;
var MAIL_SENT_ADMIN = 3;
cc.Class({
    extends: cc.Component,

    properties: {
        userName: cc.Label ,
        userAvatar: cc.Button ,
        userGold: cc.Label,
        timeTotal: 0,
        userId: cc.Label
    },

    onLoad: function () {
        this.setUserInfo();
    },

    openMailPopup: function () {
        var tabString = ["Mail đến", "Mail đi", "Gửi BQT"];

        Common.showPopup(Config.name.POPUP_MAIL,function(message_box) {
            message_box.addTabs(tabString, MAIL_RECEIVED);
            message_box.appear();
        });
    },

    openChargePopup: function () {
        // var tabString = ["Viettel", "Mobifone", "VinaPhone"];
        // var nodeChild = new cc.Node();
        // nodeChild.parent = this.node;
        // var item = cc.instantiate(this.popupIngame);
        //
        // item.getComponent('PopupIngameItem').init(tabString, "charge");
        // item.setPositionX(0);
        // item.setPositionY(0);
        // nodeChild.addChild(item);

    },
    openUserInfoPopup: function () {

        var tabString = ["Hồ sơ", "Lịch sử", "Xác thực tài khoản"];

        Common.showPopup(Config.name.POPUP_USERINFO,function(popup) {

            popup.addTabs(tabString, 1);
            popup.appear();
        });

    },
    openSettingPopup: function () {
        Common.showPopup(Config.name.POPUP_SETTING,function(popup) {
            popup.appear();
        });

    },
    setUserInfo: function() {
        this.userName.string = Common.getUserName();
        this.userGold.string = Common.numberFormatWithCommas(Common.getCash());
        this.userId.string = Common.getUserId();
    },
    update: function(dt) {
        this.timeTotal = this.timeTotal + dt;
        if(this.timeTotal >= 0.5) {
            this.timeTotal = 0;
            this.setUserInfo();
        }
    }
});
