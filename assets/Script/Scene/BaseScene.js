var NetworkManager = require("NetworkManager");
cc.Class({
    extends: cc.Component,

    // properties: {
    //
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
            case NetworkManager.MESSAGE_ID.LOGOUT:
                var msg = buffer.response;
                this.logOutMessageResponseHandler(msg);
                break;
        }
    },
    logOutMessageResponseHandler: function(resp) {
        cc.log("log out message:", resp.toObject());
        if(resp.getResponsecode()) {
            cc.director.runScene('Intro');
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
    },
    showToast: function (strMess, target, delayTime) {
        delayTime = delayTime !== null ? delayTime : 2;
        var nodeChild = new cc.Node();
        nodeChild.parent = target.node;
        var mess_bg = nodeChild.addComponent(cc.Sprite);
        mess_bg.node.setPosition(cc.p(cc.winSize.width/2, cc.winSize.height/2));
        var url = "resources/common/popup/setting/bg_popup_setting_text.png";
        var image = cc.url.raw(url);
        var texture = cc.textureCache.addImage(image);
        mess_bg.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);

        var nodeChildLabel = new cc.Node();
        nodeChildLabel.parent = target.node;
        var message = nodeChildLabel.addComponent(cc.Label);
        message.node.setPosition(cc.p(cc.winSize.width/2,cc.winSize.height/2));
        message.string = strMess;

        mess_bg.node.runAction(cc.sequence(cc.delayTime(delayTime), cc.removeSelf(), null));
        message.node.runAction(cc.sequence(cc.delayTime(delayTime), cc.removeSelf(), null));

    }
});

