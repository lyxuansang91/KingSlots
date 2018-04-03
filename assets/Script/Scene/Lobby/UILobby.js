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
        userId: cc.Label,
        avatarSprite: cc.Prefab
    },

    onLoad: function () {
        this.setUserInfo();
    },

    openExchange: function() {
        if(Common.assetsConfigList.length > 0) {
            Common.showPopup(Config.name.POPUP_EXCHANGE, function (popup) {
                popup.appear();
            });
        } else {
            Common.showToast("Kênh đổi thưởng đang bảo trì, vui lòng thử lại sau!");
        }
    },

    openMailPopup: function () {
        var tabString = ["Mail đến", "Mail đi", "Gửi BQT"];

        Common.showPopup(Config.name.POPUP_MAIL,function(message_box) {
            message_box.addTabs(tabString, MAIL_RECEIVED);
            message_box.appear();
        });
    },

    openChargePopup: function () {
        var tabString = ["Thẻ cào", "SMS"];

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
        this.userName.string = Common.getDisplayName();
        this.userGold.string = Common.numberFormatWithCommas(Common.getCash());
        this.userId.string = Common.getUserId();

        var avatarId = Common.getAvatarId() - 100000;

        var item = cc.instantiate(this.avatarSprite);
        var avaSprite = item.getComponent("AvatarSprite").init(avatarId);

        this.userAvatar.getComponent(cc.Sprite).spriteFrame = avaSprite;

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
    smsConfigResponseHandler: function(resp) {
        cc.log("sms config response handler:", resp.toObject());
        Common.smsConfigLists = [];
        if(resp.getResponsecode()) {
            for(var i = 0; i < resp.getNumbersList().length; i++) {
                var obj = {};
                var smsNumber = resp.getNumbersList()[i];
                obj.number = smsNumber.getNumber();
                obj.samesyntax = smsNumber.getSamesyntax();
                obj.dayquota = smsNumber.getDayquota();
                obj.providersList = [];
                for(var j = 0; j < smsNumber.getProvidersList().length; j++) {
                    var obj_provider = {};
                    var provider = smsNumber.getProvidersList()[j];
                    obj_provider.providerid = provider.getProviderid();
                    obj_provider.providercode = provider.getProvidercode();
                    obj_provider.providername = provider.getProvidername();
                    obj_provider.syntaxesList = [];
                    for(var k = 0; k < provider.getSyntaxesList().length; k++) {
                        var obj_syntax = {};
                        var syntax = provider.getSyntaxesList()[k];
                        obj_syntax.syntaxid = syntax.getSyntaxid();
                        obj_syntax.syntax = syntax.getSyntax();
                        obj_syntax.parvalue = syntax.getParvalue();
                        obj_syntax.promotion = syntax.getPromotion();
                        obj_syntax.targetnumber = syntax.getTargetnumber();
                        obj_syntax.cashvalue = syntax.getCashvalue();
                        obj_provider.syntaxesList.push(obj_syntax);
                    }
                    obj.providersList.push(obj_provider);
                }
                Common.smsConfigLists.push(obj);
            }
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage());
        }
    },
    updateMoneyResponseHandler: function(resp) {
        cc.log("update money response handler: ", resp.toObject());
        if(resp.getResponsecode()) {
            if(resp.getMoneyboxesList().length > 0) {
                var money_box = resp.getMoneyboxesList()[0];
                if(money_box.getUserid() === Common.getUserId()) {
                    Common.setCash(money_box.getCurrentmoney());
                    this.setUserInfo();
                }
            }
        }

        if(resp.hasMessage() && resp.getMessage() !== "") {
            Common.showToast(resp.getMessage());
        }
    },
    assetConfigResponseHandler: function(resp) {
        cc.log("asset config response handler:", resp.toObject());
        Common.assetsConfigList = [];
        if(resp.getResponsecode()) {
            resp.getAssetsList().forEach(function(asset) {
                var obj = {};
                obj.assetid = asset.getAssetid();
                obj.type = asset.getType();
                obj.provider = asset.getProvider();
                obj.parvalue = asset.getParvalue();
                obj.cashvalue = asset.getCashvalue();
                obj.assetname = asset.getAssetname();
                obj.active = asset.getActive();
                obj.minaccountbalance = asset.getMinaccountbalance();
                obj.trustedindex = asset.getTrustedindex();
                Common.assetsConfigList.push(obj);
            });

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
                this.cardConfigResponseHandler(resp);
                break;
            case NetworkManager.MESSAGE_ID.SMS_CONFIG:
                this.smsConfigResponseHandler(resp);
                break;
            case NetworkManager.MESSAGE_ID.UPDATE_MONEY:
                this.updateMoneyResponseHandler(resp);
                break;
            case NetworkManager.MESSAGE_ID.ASSET_CONFIG:
                this.assetConfigResponseHandler(resp);
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
