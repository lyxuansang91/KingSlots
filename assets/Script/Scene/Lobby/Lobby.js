var BaseScene = require('BaseScene');

cc.Class({
    extends: BaseScene,

    properties: {
        LoginUI: cc.Node,
        RegisterUI : cc.Node,
        MenuUI : cc.Node,
        ListGameUI : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        /*if(window.loginMessage !== null) {
            Common.showPopup(Config.name.POPUP_MESSAGE_BOX,function(message_box) {
                message_box.init(window.loginMessage, Config.COMMON_POPUP_TYPE.MESSAGE_BOX.CONFIRM_TYPE, function() {

                });
                message_box.appear();
            });
        }*/
    },
});
