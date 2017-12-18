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
        popupSetting: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {

    },

    openPopup: function () {
        var item = cc.instantiate(this.popupSetting);
        cc.log("item", item);
        item.setPosition(cc.p(0,0));
        item.zIndex = 1000;
        this.node.addChild(item);
    }
});
