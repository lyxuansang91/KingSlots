
cc.Class({
    extends: cc.Component,

    properties: {
        view : cc.Node,
    },

    onLoad : function() {
        this.initIap();
    },

    initIap: function () {
        if(cc.sys.platform === cc.sys.IPHONE ||
            cc.sys.platform === cc.sys.IPAD ||
            cc.sys.platform === cc.sys.ANDROID){

            var self = this;

            self.productNames = [];

            sdkbox.IAP.init();
            sdkbox.IAP.setDebug(true);
            sdkbox.IAP.setListener({
                onSuccess : function (product) {
                    cc.log("Purchase successful: " + JSON.stringify(product));
                    cc.log("Purchase successful: " + product.name);
                },
                onFailure : function (product, msg) {
                    cc.log("Purchase failed: " + product.name + " error: " + msg);

                },
                onCanceled : function (product) {
                    cc.log("Purchase canceled: " + product.name);
                },
                onRestored : function (product) {
                    cc.log("Restored: " + product.name);
                },
                onProductRequestSuccess : function (products) {
                    for (var i = 0; i < products.length; i++) {
                        cc.log("================");
                        cc.log("name: " + products[i].name);
                        cc.log("price: " + products[i].price);
                        cc.log("priceValue: " + products[i].priceValue);
                        cc.log("================");

                        var name = products[i].name;
                        cc.log("purchase: " + name);
                        self.productNames[i] = name;
                    }
                },
                onProductRequestFailure : function (msg) {
                    cc.log("Failed to get products");
                },
                onShouldAddStorePayment: function(productId) {
                    cc.log("onShouldAddStorePayment:" + productId);
                    return true;
                },
                onFetchStorePromotionOrder : function (productIds, error) {
                    cc.log("onFetchStorePromotionOrder:" + " " + " e:" + error);
                },
                onFetchStorePromotionVisibility : function (productId, visibility, error) {
                    cc.log("onFetchStorePromotionVisibility:" + productId + " v:" + visibility + " e:" + error);
                },
                onUpdateStorePromotionOrder : function (error) {
                    cc.log("onUpdateStorePromotionOrder:" + error);
                },
                onUpdateStorePromotionVisibility : function (error) {
                    cc.log("onUpdateStorePromotionVisibility:" + error);
                }
            });
        }
    },

    buttonClick : function (event, customEventData) {
        var index = customEventData;
        cc.log("productNames : " + this.productNames);

        cc.log("productName >> : " + customEventData + "/" + this.productNames[index]);
        if(index < this.productNames.length) {
            sdkbox.IAP.purchase(this.productNames[index]);
        }
    }
});
