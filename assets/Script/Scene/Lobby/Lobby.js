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
        if(window.ws && window.ws.onmessage)
            window.ws.onmessage = this.onGameStatus.bind(this);
    },
    onGameStatus: function(e) {
        cc.log("on game status lobby");
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            cc.log("list message size:" + lstMessage.length);
            if(lstMessage.length > 0) {
                for(var i = 0; i < lstMessage.length; i++){
                    var buffer = lstMessage[i];
                    this.handleMessage(buffer);
                }
            }
        }
    },
    handleMessage: function(buffer) {

    },
    onClickSetting: function() {
        cc.log("on click setting");
    },
    onEnable: function() {
        cc.log("on enable");
    },
    onDestroy: function() {
        cc.log("on destroy");
    },
    onDisable: function() {
        cc.log("on disabled");
    },
    onStart: function() {
        cc.log("on start Lobby");
    }
});
