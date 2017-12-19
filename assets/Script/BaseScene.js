var NetworkManager = require("NetworkManager");
cc.Class({
    extends: cc.Component,

    // properties: {
    //     // foo: {
    //     //    default: null,      // The default value will be used only when the component attaching
    //     //                           to a node for the first time
    //     //    url: cc.Texture2D,  // optional, default is typeof default
    //     //    serializable: true, // optional, default is true
    //     //    visible: true,      // optional, default is true
    //     //    displayName: 'Foo', // optional
    //     //    readonly: false,    // optional, default is false
    //     // },
    //     // ...
    // },

    // use this for initialization
    onLoad: function () {
        cc.log("Base scene");
        cc.log("abc zxhyzzdas");
    },
    handleMessage: function(buffer) {
        cc.log("buffer:", buffer);
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.INITIALIZE:
                var msg = buffer.response;
                this.initialMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.PING:
                var msg = buffer.response;
                this.pingMessageResponseHandler(msg);
                break;
        }
    },
    initialMessageResponseHandler: function(initialMessage) {
        cc.log("initialMessage", initialMessage);
        if (initialMessage != 0) {
            //common.initialize = initialMessage.responseCode;
            if (initialMessage.getResponsecode()) {
                var serverAppVersion = initialMessage.getCurrentappversion();
                cc.log("serverAppVersion = ", serverAppVersion);
                var hot_lines = [];
                cc.log("hot_line size", initialMessage.getHotlinesList().length);
                for (var i = 0; i < initialMessage.getHotlinesList().length; i++){
                    hot_lines.push(initialMessage.getHotlinesList()[i]);
                }
                cc.log("hot_lines = ", hot_lines);
                /*Set enable game ids*/
                var _gameIds = [];
                for (var i = 0; i < initialMessage.getEnablegameidsList().length; i++) {
                    _gameIds.push(initialMessage.getEnablegameidsList()[i]);
                }

                cc.log("game id = ", _gameIds);
                Common.setEnableGameIds(_gameIds);
                cc.director.loadScene('Login');

            }else {
                // PopupMessageBox* popupMessage = new PopupMessageBox();
                // popupMessage.showPopup(init_response.message());
            }
        }
    },
    pingMessageResponseHandler: function(res) {
        cc.log("ping response handler:", res);
        if(res.getResponsecode()) {
            if(res.getDisconnect()) {
                Common.setSessionId("-1");
                if(res.hasMessage() && res.getMessage() != "") {
                    cc.alert(res.getMessage());
                }
                NetworkManager.closeConnection();
                this.scheduleOnce(this.goIntroScene, 2.0);
            }
        }
    }


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

