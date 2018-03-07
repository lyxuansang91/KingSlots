const NetworkManager = require('NetworkManager');

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
        var tabString = ["Thẻ cào", "SMS"];
        NetworkManager.getCardConfigRequest(Config.CARD_CONFIG_TYPE.TYPE_CASH);
        Common.showPopup(Config.name.POPUP_CHARGING,function(popup) {
            popup.addTabs(tabString, 1);
            popup.appear();
        });

    },
    openUserInfoPopup: function () {

        var tabString = ["Hồ sơ", "Lịch sử"];

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
    openGiftPopup: function () {

        var tabString = ["Nhập giftcode", "Giftcode đã nhận"];

        Common.showPopup(Config.name.POPUP_GIFT,function(popup) {
            popup.addTabs(tabString, 1);
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
        this.onGameEvent();
    },
    cardConfigResponseHandler: function(resp) {
        cc.log("card config response handler:", resp.toObject());
        Common.providerLists = [];
        if(resp.getResponsecode()) {
            for(var i = 0; i < resp.getProvidersList().length; i++) {
                var obj = {};
                var provider = resp.getProvidersList()[i];
                obj.providerid = provider.getProviderid();
                obj.providercode = provider.getProvidercode();
                obj.providername = provider.getProvidername();
                obj.productsList = [];
                for(var j = 0; j < provider.getProductsList().length; j++) {
                    var product = provider.getProductsList()[j];
                    var obj_product = {};
                    obj_product.productid = product.getProductid();
                    obj_product.parvalue = product.getParvalue();
                    obj_product.cashvalue = product.getCashvalue();
                    obj_product.description = product.getDescription();
                    obj_product.promotion = product.getPromotion();
                    obj.productsList.push(obj_product);
                }
                Common.providerLists.push(obj);
            }
        }
        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage());
        }
    },
    handleMessage: function(buffer) {
        var isDone = true;
        var resp = buffer.response;
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.CARD_CONFIG:
                cc.log("card config ui lobby");
                this.cardConfigResponseHandler(resp);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },
    onGameEvent: function() {
        NetworkManager.checkEvent(function(buffer) {
            return this.handleMessage(buffer);
        }.bind(this));
    }
});
