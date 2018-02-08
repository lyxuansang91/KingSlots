var NetworkManager = require("NetworkManager");
cc.Class({
    extends: cc.Component,

    properties: {

    },

    update : function(dt){
    },

    onLoad: function () {
        cc.log("Base scene");
    },

    onDestroy: function() {
        this.unscheduleAllCallbacks();
    },

    handleMessage: function(buffer) {
        NetworkManager.hideLoading();
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
            case NetworkManager.MESSAGE_ID.LOGOUT:
                var msg = buffer.response;
                this.logOutMessageResponseHandler(msg);
                break;
        }
    },
    logOutMessageResponseHandler: function(resp) {
        cc.log("log out message:", resp.toObject());
        if(resp.getResponsecode()) {
            cc.director.loadScene('Intro');
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
                // NetworkManager.hideLoading();
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
    },

    showToast: function (strMess, delayTime) {
        if(strMess == ""){

            //return;
        }

        var delay = delayTime !== null ? delayTime : 2;

        var scene = cc.director.getScene();
        if(cc.isValid(scene)){
            if(!cc.isValid(scene.getChildByName("Toast"))){
                cc.loader.loadRes("prefabs/Toast",function(error, prefab) {
                    if(!error){
                        var toast_prefab = cc.instantiate(prefab);
                        if(cc.isValid(toast_prefab)){
                            toast_prefab.x = Common.width / 2;
                            toast_prefab.y = Common.height / 2;

                            var toast = toast_prefab.getComponent("Toast");
                            toast.loadMessage(strMess,delay);
                            scene.addChild(toast_prefab,Config.index.LOADING);
                        }
                    }
                })
            }else{
                var toast = scene.getChildByName("Toast").getComponent("Toast");
                toast.loadMessage(strMess,delayTime);
            }
        }
    }
});

