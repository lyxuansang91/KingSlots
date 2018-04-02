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
        var isDone = true;
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
            case NetworkManager.MESSAGE_ID.EMERGENCY_NOTIFICATION:
                var msg = buffer.response;
                this.getEmergencyNotificationResponse(msg);
                break;
            case NetworkManager.MESSAGE_ID.HEAD_LINE:
                var msg = buffer.response;
                this.getHeadLineResponse(msg);
                break;
            default:
                isDone = false;
                break;
        }
        return isDone;
    },
    logOutMessageResponseHandler: function(resp) {
        cc.log("log out message:", resp.toObject());
        if(resp.getResponsecode()) {
            Common.setSessionId("-1");
            NetworkManager.closeConnection();
            cc.director.loadScene('IntroScene');
        } else {
            Common.showToast(resp.getMessage());
        }

    },
    initialMessageResponseHandler: function(initialMessage) {
        cc.log("initialMessage", initialMessage);
        if (initialMessage !== 0) {
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
                Common.showToast(initialMessage.getMessage());
            }
        }
    },
    pingMessageResponseHandler: function(res) {
        //cc.log("ping response handler:", res);
        if(res.getResponsecode()) {
            if(res.getDisconnect()) {
                Common.setSessionId("-1");
                if(res.hasMessage() && res.getMessage() !== "") {
                    Common.showToast(res.getMessage(), 2.0);
                }
                NetworkManager.closeConnection();
                this.scheduleOnce(this.goIntroScene, 2.0);
            }
        }
    },

    getHeadLineResponse: function (response) {
        if (response != 0 && response.getResponsecode() && response.getHeadlinesList().length > 0){
            cc.log("getHeadLineResponse : ",response.toObject());
            var notify = [];
            for (var i = 0; i < response.getHeadlinesList().length; i++){
                notify.push(response.getHeadlinesList()[i]);
            }

            Common.setHeadLineEmergency(notify);
        }
    },

    getEmergencyNotificationResponse: function(response){
        if (response !== 0 && response.getResponsecode()){

            var notifications = "";
            var notification_list = response.getNotificationsList();
            if (response.getNotificationsList().length > 0){
                for (var i = 0; i < notification_list.length; i++){
                    notifications += notification_list[i] + " ";
                }
            }

            Common.setNotificationEmergency(notifications);

            cc.log("setNotificationEmergency : ",notifications);

            if (response.getHeadlinesList().length > 0){
                Common.setHeadLineEmergency(response.getHeadlinesList());

                var scene = cc.director.getScene();
                if(cc.isValid(scene)){
                    if(!cc.isValid(scene.getChildByName("NodeHeadLine"))){
                        cc.loader.loadRes("prefabs/NodeHeadLine",function(error, prefab) {
                            if(!error){
                                var headLine_prefab = cc.instantiate(prefab);
                                if(cc.isValid(headLine_prefab)){


                                    var headLine = headLine_prefab.getComponent("NodeHeadLine");
                                    //headLine_prefab.x = Common.origin.x + Common.width / 2;
                                    //headLine_prefab.y = Common.origin.y + Common.height/2;

                                    headLine.showHeadLine();
                                    scene.addChild(headLine_prefab,Config.index.HEADLINE);
                                }
                            }
                        });
                    }else{
                        var headLine = scene.getChildByName("NodeHeadLine").getComponent("NodeHeadLine");
                        headLine.showHeadLine();
                    }
                }
            }


        }
    },

    openPopupSetting : function () {
        Common.showPopup(Config.name.POPUP_SETTING,function(popup) {
            popup.appear();
        });
    }
});

