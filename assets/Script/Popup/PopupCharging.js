const CommonPopup = require('CommonPopup');

cc.Class({
    extends: CommonPopup,

    properties: {
        body: cc.Node,
        _tab: 1,
        subHistory: 1
    },
    // onLoad () {},

    start: function() {

    },

    onLoad: function () {
        // NetworkManager.getCardConfigRequest(Config.CARD_CONFIG_TYPE.TYPE_CASH);
    },

    addTabs: function (tabs, index) {
        this.initTabs(tabs, index);
    },

    initTabs: function (tabs, index) {
        this._super(tabs, index);
    },

    onEvent: function(index) {
        var nodeNapThe = this.body.getChildByName("NodeNapThe");
        var nodeNapSms = this.body.getChildByName("NodeNapSMS");
        switch(index) {
            case 1:
                if(Common.providerLists.length > 0) {
                    nodeNapThe.active = true;
                    nodeNapSms.active = false;
                    nodeNapThe.getComponent("NodeNapThe").initTabLeft();
                } else {
                    Common.showToast("Kênh nạp thẻ đang bảo trì, vui lòng thử lại!");
                }
                break;
            case 2:
                if(Common.smsConfigLists.length > 0) {
                    nodeNapThe.active = false;
                    nodeNapSms.active = true;
                    nodeNapSms.getComponent("NodeNapSMS").initTabLeft();
                } else {
                    Common.showToast("Kênh nạp SMS đang bảo trì, vui lòng thử lại!");
                }
                break;
            case 3:
                break;
            default:
                break;
        }

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

    update: function(dt) {
    }
});
