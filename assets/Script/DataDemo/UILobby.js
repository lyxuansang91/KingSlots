cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        popupSetting: cc.Prefab,
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
        cc.log("item", item);
        item.setPosition(cc.p(0,0));
        item.zIndex = 1000;
        this.node.addChild(item);
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
