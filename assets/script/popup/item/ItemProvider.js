
cc.Class({
    extends: cc.Component,

    properties: {

    },

    init : function (money,gold) {
        this.node.getChildByName("money").getComponent(cc.Label).string = Common.convertIntToMoneyView(money);
        this.node.getChildByName("gold").getComponent(cc.Label).string = Common.convertIntToMoneyView(gold);
    }
});
