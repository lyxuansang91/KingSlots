cc.Class({
    extends: cc.Component,

    properties: {
        lblParValue: cc.Label,
        lblCashValue: cc.Label
    },

    init: function(parValue, cashValue, syntax, number) {
        this.cashValue = cashValue;
        this.parValue = parValue;
        this.lblParValue.string = Common.numberFormatWithCommas(parValue);
        this.lblCashValue.string = Common.numberFormatWithCommas(cashValue);
        this.syntax = syntax;
        this.number = number;
    },
    smsEvent: function() {
        var self = this;
        Common.showPopup(Config.name.POPUP_MESSAGE_BOX, function(popup) {
            popup.init("Soạn " + self.syntax + " đến " + self.number + " để nhận được " + self.cashValue + " BIT", Config.COMMON_POPUP_TYPE.MESSAGE_BOX.CONFIRM_TYPE, function() {
                cc.log("call back");
            });
            popup.appear();
        });
    }
});
