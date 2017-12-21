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
        prefabPopupTaiXiu: cc.Prefab

    },

    // use this for initialization
    onLoad: function () {
    },
    onClickSetting: function() {

        cc.log("on click setting");
        var item = cc.instantiate(this.prefabPopupTaiXiu);
        this.node.setPosition(cc.p(0,0));
        this.node.addChild(item);
    }

});
