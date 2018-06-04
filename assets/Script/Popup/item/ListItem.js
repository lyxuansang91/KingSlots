cc.Class({
    extends: cc.Component,

    properties: {
        lblParValue: cc.Label,
        lblCashValue: cc.Label,
    },

    init: function(parValue, cashValue, callback) {
        this.cashValue = cashValue;
        this.parValue = parValue;
        this.lblParValue.string = Common.numberFormatWithCommas(parValue);
        this.lblCashValue.string = Common.numberFormatWithCommas(parValue);
        this.callback = callback;
        
    },
    
    itemClick: function () {
        this.callback(this.parValue);
    }
});
