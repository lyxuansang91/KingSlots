cc.Class({
    extends: cc.Component,

    properties: {
        lblParValue: cc.Label,
        lblCashValue: cc.Label,
        icon_money : cc.Sprite,
        icon_frames : [cc.SpriteFrame],
    },

    init: function(index,parValue, cashValue, syntax, number) {
        this.cashValue = cashValue;
        this.parValue = parValue;
        this.lblParValue.string = Common.numberFormatWithCommas(parValue);
        this.lblCashValue.string = Common.numberFormatWithCommas(cashValue);
        this.syntax = syntax;
        this.number = number;

        if(index > 5){
            index = 5;
        }
        this.icon_money.spriteFrame = this.icon_frames[index];
        
    },
    smsEvent: function() {
        var self = this;
        Common.showPopup(Config.name.POPUP_MESSAGE_BOX, function(popup) {
            popup.init("Soạn " + self.syntax + " đến " + self.number + " để nhận được " + self.cashValue + " GOLD", Config.COMMON_POPUP_TYPE.MESSAGE_BOX.CONFIRM_TYPE, function() {
            });
            popup.appear();
        });
    }
});
