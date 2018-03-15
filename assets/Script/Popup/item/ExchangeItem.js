cc.Class({
    extends: cc.Component,

    properties: {
        lblParValue: cc.Label,
        lblCashValue: cc.Label
    },

    init: function(assetItem) {
        this.cashValue = assetItem.cashvalue;
        this.parValue = assetItem.parvalue;
        this.lblParValue.string = Common.numberFormatWithCommas(this.parValue);
        this.lblCashValue.string = Common.numberFormatWithCommas(this.cashValue);
    }
});
