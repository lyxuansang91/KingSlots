
cc.Class({
    extends: cc.Component,

    properties: {
        money: cc.Label,
        gold: cc.Label
    },

    init : function (money, gold, assetId, callBack) {
        cc.log("assetId init =", assetId);
        this.money.string = Common.convertIntToMoneyView(money);
        this.gold.string = Common.convertIntToMoneyView(gold);
        this.assetId = assetId;
        this.callBack = callBack;
    },
    
    itemClick: function () {
        this.callBack(this.assetId);
    }
});
