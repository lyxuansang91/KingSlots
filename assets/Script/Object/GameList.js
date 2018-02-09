var NetworkManager = require('NetworkManager');
var BacayScene = require('BaCayScripts');
var minipoker = require('minipoker');

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: cc.ScrollView,
        prefabGameItem: cc.Prefab,
        roomIndex : 0,
        lbl_moneys: [],
        jarValue: 0,
        timeDelta: 0,
        jarResponse: null,
        jarRequest: null,
        isRequestJar: false,
        isBindNetwork: false
    },

    // use this for initialization
    onLoad: function () {
        cc.log("on load game list");
        var self = this;
        this.content = this.scrollView.content;
        this.populateList();
    },
    onDestroy: function() {
        cc.log("on destroy");
        var self = this;
        self.unscheduleAllCallbacks();
    },
    onEnable: function() {
        cc.log("on enable");
    },
    onDisable: function() {
        cc.log("on disabled");
    },
    populateList: function() {
        var listGame = [Common.ZONE_ID.MINI_BACAY,Common.ZONE_ID.MINI_POKER,
            Common.ZONE_ID.TAIXIU, Common.ZONE_ID.VQMM, Common.ZONE_ID.TREASURE];

        this.requestJar();

        var innerSize = cc.size(0,this.content.getContentSize().height);

        for (var i = 0; i < listGame.length; ++i) {
            var item = cc.instantiate(this.prefabGameItem);
            item.setTag(listGame[i] + 1000);
            item.getComponent('LobbyGameItem').init(i, listGame[i]);
            item.setPositionY(this.content.getContentSize().height*0.06);
            this.content.addChild(item);

            innerSize.width += item.getContentSize().width*1.1;
        }

        this.content.setContentSize(innerSize);
    },

    scrollToLeft: function(){
    },

    scrollToRight: function(){
        this.scrollView.jumpTo(0.25,100);
    },

    requestJar: function() {
        if(!this.isRequestJar) {
            this.isRequestJar = true;
            NetworkManager.getJarRequest(0, null);
        }
    },
    bindNetwork: function() {
      if(window.ws && window.ws.onmessage) {
          var self = this;
          window.ws.onmessage = this.ongamestatus.bind(this);
          this.schedule(self.requestJar, 5);
      }
    },

    update: function (dt) {
        if(!Common.isExistTaiXiu() && !this.isBindNetwork) {
            this.isBindNetwork = true;
            this.bindNetwork();
        }
    },

    goSceneTable: function() {
        window.ws.onmessage = this.ongamestatus.bind(this);
    },

    ongamestatus: function(event) {
        cc.log("on game status game list");
        NetworkManager.hideLoading();
        if(event.data!==null || event.data !== 'undefined') {
            var lstMessage = NetworkManager.parseFrom(event.data, event.data.byteLength);
            for(var i = 0; i < lstMessage.length; i++) {
                var buffer = lstMessage[i];
                this.handleMessage(buffer);
            }
        }
    },

    jarResponseHandler: function(resp) {
        cc.log("jar response handler:", resp.toObject());
        if(resp.getResponsecode()) {
            if(resp.getJarinfoList().length > 0) {
                this.isRequestJar = false;
                for(var i = 0; i < resp.getJarinfoList().length; i++) {
                    var jarItem = resp.getJarinfoList()[i];
                    var gameid = jarItem.getGameid();
                    var value = jarItem.getValue();
                    var jarType = jarItem.getJartype();
                    var item = this.content.getChildByTag(gameid + 1000);
                    if(item !== null && item.getName() === 'LobbyGameItem')
                        item.getComponent('LobbyGameItem').updateJarMoney(value, jarType);
                }
            }
        }
    },

    handleMessage: function(buffer) {
        switch (buffer.message_id) {
            case NetworkManager.MESSAGE_ID.ENTER_ZONE:
                var msg = buffer.response;
                this.enterZoneMessageResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.ENTER_ROOM:
                var msg = buffer.response;
                this.enterRoomResponseHandler(msg);
                break;
            case NetworkManager.MESSAGE_ID.JAR:
                var msg = buffer.response;
                this.jarResponseHandler(msg);
                break;
        }
    },

    enterZoneMessageResponseHandler: function(enterZoneMessage) {
        if (enterZoneMessage != 0) {
            //common.initialize = initialMessage.responseCode;
            cc.log("enter zone response:", enterZoneMessage.toObject());
            if (enterZoneMessage.getResponsecode()) {
                Common.setEnterZone(enterZoneMessage);
                var zoneId = enterZoneMessage.getZoneid();
                Common.setZoneId(zoneId);

                Common.setRequestRoomType(enterZoneMessage.getDefaultroomtypeload());
                if (enterZoneMessage.hasEnabledisplayroomlist() &&
                    enterZoneMessage.getEnabledisplayroomlist()) {
                    /*
                     Sau này xử lý phần người chơi click vào một mức cược cụ thể không cần hiển thị danh sách phòng chơi
                     */
                    var cashRoomList = [];
                    if (enterZoneMessage.getCashroomconfigsList().length > 0) {
                        for (var i = 0; i < enterZoneMessage.getCashroomconfigsList().length; i++) {
                            cashRoomList.push(enterZoneMessage.getCashroomconfigsList()[i]);
                        }
                    }
                    Common.setCashRoomList(cashRoomList);
                }

                if (Common.getZoneId() !== -1) {
                    // notify->onHideNotify();
                    // this->unscheduleUpdate();

                    if(Common.getZoneId() === Common.ZONE_ID.TAIXIU) {
                        NetworkManager.getEnterRoomMessageFromServer(0, "");
                    }
                    //cc.director.loadScene('Table');
                }

            }else {
                // Common::getInstance()->setRequestRoomType(-1);
                // Common::getInstance()->setZoneId(-1);  //reset zone id
            }
        }
    },
    loadTaiXiu: function() {
        var scene = cc.director.getScene();
        if(cc.isValid(scene) && !cc.isValid(scene.getChildByName("PopupTaiXiu"))){
            cc.loader.loadRes("prefabs/PopupTaiXiu",function(error, prefab) {
                if(!error){
                    var taiXiu = cc.instantiate(prefab);
                    if(cc.isValid(taiXiu)){
                        taiXiu.x = Common.width / 2;
                        taiXiu.y = Common.height / 2;
                        scene.addChild(taiXiu);
                    }
                }
            });
        }
    },
    enterRoomResponseHandler: function(response) {
        cc.log("enter room response: ", response);
        if (response.getResponsecode()) {
            cc.log("enterZone = ", Common.getEnterZone());
            if (Common.getZoneId() === Common.ZONE_ID.MINI_BACAY) {
                cc.director.loadScene('BaCay',function(){
                    BacayScene.instance.initDataFromLoading(Common.getEnterZone(), response);
                });

            }
            else if (Common.getZoneId() === Common.ZONE_ID.MINI_POKER) {
                // cc.director.loadScene('BaCay',function(){
                //     BacayScene.instance.initDataFromLoading(Common.getEnterZone(), response);
                // });
                cc.director.loadScene('minipoker', function() {
                    minipoker.instance.initDataFromLoading(Common.getEnterZone(), response);
                });
            } else if(Common.getZoneId() === Common.ZONE_ID.TAIXIU) {
                var self = this;
                self.loadTaiXiu();
                self.isBindNetwork = false;
                self.unscheduleAllCallbacks();
            } else if(Common.getZoneId() === Common.ZONE_ID.TREASURE) {
                cc.director.loadScene('Treasure');
            }
        }
    }
});
