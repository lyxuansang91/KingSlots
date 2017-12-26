cc.Class({
    extends: cc.Component,

    properties: {
        cardPrefab: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        var item = cc.instantiate(this.cardPrefab);
        // item.getComponent('GameItem').init(i, listGame[i]);
        // item.setPositionY(this.content.getContentSize().height*0.06);
        // this.content.addChild(item);
        cc.log("item = ", item);
    },

    quayEvent: function () {
        cc.log("ba cay =", this.node);
    }
});
