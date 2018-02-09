var BaseScene = require('BaseScene');

cc.Class({
    extends: BaseScene,

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
    }
});
