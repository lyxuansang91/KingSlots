cc.Class({
    extends: cc.Component,

    properties: {
        popupSetting: cc.Prefab,
        popupIngame: cc.Prefab,
        userName: cc.Label ,
        userAvatar: cc.Sprite ,
        userGold: cc.Label,
        timeTotal: 0
    },

    // use this for initialization
    onLoad: function () {
        this.setUserInfo();
    },

    openPopup: function () {
        var item = cc.instantiate(this.popupSetting);
        item.getComponent('Popup').appear();
        item.zIndex = 1000;

        this.node.addChild(item);
    },
    openChargePopup: function () {
        var tabString = ["Viettel", "Mobifone", "VinaPhone"];
        var nodeChild = new cc.Node();
        nodeChild.parent = this.node;
        var item = cc.instantiate(this.popupIngame);

        item.getComponent('PopupIngameItem').init(tabString, "charge");
        item.setPositionX(0);
        item.setPositionY(0);
        nodeChild.addChild(item);

        // var item = cc.instantiate(this.popupIngame);
        // item.setPosition(cc.p(0,0));
        // item.zIndex = 1000;
        // this.node.addChild(item);
    },
    setUserInfo: function() {
        this.userName.string = Common.getUserName();
        this.userGold.string = Common.getCash();
    },
    update: function(dt) {
        this.timeTotal = this.timeTotal + dt;
        if(this.timeTotal >= 0.5) {
            this.timeTotal = 0;
            this.setUserInfo();
        }
    }
});
